variable "name_prefix" { type = string }
variable "aws_region" { type = string }
variable "lambdas" { type = any }
variable "batch_schedules" { type = list(any) }
variable "batch_runner_lambda" { type = string }
variable "lambda_iam_roles" { type = any }

locals {
  batch_lambdas = {
    for k, v in var.lambdas : k => v if try(v.deploy_group, "") == "batch"
  }
}

resource "aws_iam_role" "batch_lambda" {
  name = "${var.name_prefix}-batch-lambda"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "batch_basic" {
  role       = aws_iam_role.batch_lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

module "lambda" {
  for_each = local.batch_lambdas
  source   = "../lambda_function"

  function_name   = "${var.name_prefix}-${each.key}"
  source_dir      = each.value.source_dir
  handler         = each.value.handler
  runtime         = each.value.runtime
  architecture    = each.value.architecture
  memory_mb       = each.value.memory_mb
  timeout_seconds = each.value.timeout_seconds
  environment     = try(each.value.environment, {})
  role_arn        = aws_iam_role.batch_lambda.arn
  tags            = { Component = "batch", LambdaKey = each.key }
}

module "schedules" {
  for_each = { for s in var.batch_schedules : s.schedule_key => s }
  source   = "../eventbridge_lambda_schedule"

  name                = "${var.name_prefix}-${each.value.schedule_key}"
  schedule_expression = each.value.schedule_expression
  lambda_arn          = module.lambda[var.batch_runner_lambda].function_arn
  input_json = jsonencode({
    cadence_id   = each.value.cadence_id
    schedule_key = each.value.schedule_key
    kind         = try(each.value.kind, "telemetry_rollup")
  })
}

output "lambda_function_names" {
  value = { for k, m in module.lambda : k => m.function_name }
}
