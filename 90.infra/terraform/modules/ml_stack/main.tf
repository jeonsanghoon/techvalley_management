variable "name_prefix" { type = string }
variable "aws_region" { type = string }
variable "lambdas" { type = any }
variable "ml_triggers" { type = list(any) }
variable "lambda_iam_roles" { type = any }

locals {
  ml_lambdas = {
    for k, v in var.lambdas : k => v if try(v.deploy_group, "") == "ml"
  }
  ml_schedule_triggers = {
    for t in var.ml_triggers : t.schedule_key => t
    if try(t.schedule_expression, null) != null && try(t.enabled, true)
  }
}

resource "aws_iam_role" "ml_lambda" {
  name = "${var.name_prefix}-ml-lambda"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ml_basic" {
  role       = aws_iam_role.ml_lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

module "lambda" {
  for_each = local.ml_lambdas
  source   = "../lambda_function"

  function_name   = "${var.name_prefix}-${each.key}"
  source_dir      = each.value.source_dir
  handler         = each.value.handler
  runtime         = each.value.runtime
  architecture    = each.value.architecture
  memory_mb       = each.value.memory_mb
  timeout_seconds = each.value.timeout_seconds
  environment     = try(each.value.environment, {})
  role_arn        = aws_iam_role.ml_lambda.arn
  tags            = { Component = "ml", LambdaKey = each.key }
}

resource "aws_cloudwatch_event_rule" "ml_schedule" {
  for_each = local.ml_schedule_triggers

  name                = "${var.name_prefix}-${each.key}"
  schedule_expression = each.value.schedule_expression
}

resource "aws_cloudwatch_event_target" "ml_schedule" {
  for_each = local.ml_schedule_triggers

  rule      = aws_cloudwatch_event_rule.ml_schedule[each.key].name
  target_id = "lambda"
  arn       = module.lambda[each.value.lambda_ref].function_arn
}

resource "aws_lambda_permission" "ml_schedule" {
  for_each = local.ml_schedule_triggers

  statement_id  = "AllowExecutionFromEventBridge-${each.key}"
  action        = "lambda:InvokeFunction"
  function_name = module.lambda[each.value.lambda_ref].function_arn
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.ml_schedule[each.key].arn
}

output "lambda_function_names" {
  value = { for k, m in module.lambda : k => m.function_name }
}
