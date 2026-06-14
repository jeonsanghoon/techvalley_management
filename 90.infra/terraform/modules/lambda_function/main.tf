variable "function_name" { type = string }
variable "source_dir" { type = string }
variable "handler" { type = string }
variable "runtime" { type = string }
variable "architecture" { type = string }
variable "memory_mb" { type = number }
variable "timeout_seconds" { type = number }
variable "environment" { type = map(string) }
variable "role_arn" { type = string }
variable "tags" { type = map(string) }

data "archive_file" "bundle" {
  type        = "zip"
  source_dir  = "${path.root}/${var.source_dir}"
  output_path = "${path.module}/../../.build/${var.function_name}.zip"
}

resource "aws_lambda_function" "this" {
  function_name = var.function_name
  role          = var.role_arn
  handler       = var.handler
  runtime       = var.runtime
  architectures = [var.architecture]
  memory_size   = var.memory_mb
  timeout       = var.timeout_seconds

  filename         = data.archive_file.bundle.output_path
  source_code_hash = data.archive_file.bundle.output_base64sha256

  environment {
    variables = var.environment
  }

  tags = var.tags
}

output "function_name" {
  value = aws_lambda_function.this.function_name
}

output "function_arn" {
  value = aws_lambda_function.this.arn
}
