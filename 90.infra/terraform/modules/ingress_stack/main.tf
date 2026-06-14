variable "name_prefix" { type = string }
variable "aws_region" { type = string }
variable "partition_key_field" { type = string }
variable "lambdas" { type = any }
variable "streams" { type = any }
variable "lambda_iam_roles" { type = any }

locals {
  ingress_lambdas = {
    for k, v in var.lambdas : k => v if try(v.deploy_group, "") == "ingress" || try(v.deploy_group, "") == "invoke_only"
  }
}

resource "aws_iam_role" "lambda_exec" {
  name = "${var.name_prefix}-lambda-exec"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "basic" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

module "lambda" {
  for_each = local.ingress_lambdas
  source   = "../lambda_function"

  function_name   = "${var.name_prefix}-${each.key}"
  source_dir      = each.value.source_dir
  handler         = each.value.handler
  runtime         = each.value.runtime
  architecture    = each.value.architecture
  memory_mb       = each.value.memory_mb
  timeout_seconds = each.value.timeout_seconds
  environment     = try(each.value.environment, {})
  role_arn        = aws_iam_role.lambda_exec.arn
  tags            = { Component = "ingress", LambdaKey = each.key }
}

resource "aws_kinesis_stream" "streams" {
  for_each = var.streams

  name             = "${var.name_prefix}-${each.key}"
  retention_period = try(each.value.kinesis.retention_hours, 168)

  stream_mode_details {
    stream_mode = try(each.value.kinesis.stream_mode, "ON_DEMAND")
  }
}

resource "aws_lambda_event_source_mapping" "kinesis" {
  for_each = {
    for k, v in var.streams : k => v
    if try(v.consumer.lambda_ref, null) != null
  }

  event_source_arn  = aws_kinesis_stream.streams[each.key].arn
  function_name     = module.lambda[each.value.consumer.lambda_ref].function_arn
  starting_position = try(each.value.consumer.starting_position, "LATEST")
  batch_size        = try(each.value.consumer.batch_size, 100)
}

output "lambda_function_names" {
  value = { for k, m in module.lambda : k => m.function_name }
}

output "kinesis_stream_names" {
  value = { for k, s in aws_kinesis_stream.streams : k => s.name }
}
