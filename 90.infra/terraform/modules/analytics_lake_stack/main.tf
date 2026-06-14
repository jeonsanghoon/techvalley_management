variable "enabled" { type = bool }
variable "name_prefix" { type = string }
variable "s3_bucket_suffix" { type = string }
variable "firehose_stream_suffix" { type = string }
variable "glue_database_name" { type = string }
variable "tags" { type = map(string) }

resource "aws_s3_bucket" "raw" {
  count  = var.enabled ? 1 : 0
  bucket = "${var.name_prefix}-${var.s3_bucket_suffix}"
  tags   = var.tags
}

resource "aws_s3_bucket_lifecycle_configuration" "raw" {
  count  = var.enabled ? 1 : 0
  bucket = aws_s3_bucket.raw[0].id

  rule {
    id     = "expire-firehose-landing"
    status = "Enabled"
    filter { prefix = "cold-stream-events/" }
    expiration { days = 7 }
  }

  rule {
    id     = "expire-firehose-errors"
    status = "Enabled"
    filter { prefix = "errors/firehose/" }
    expiration { days = 30 }
  }
}

resource "aws_iam_role" "firehose" {
  count = var.enabled ? 1 : 0
  name  = "${var.name_prefix}-firehose"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "firehose.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
  tags = var.tags
}

resource "aws_iam_role_policy" "firehose_s3" {
  count = var.enabled ? 1 : 0
  name  = "${var.name_prefix}-firehose-s3"
  role  = aws_iam_role.firehose[0].id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "s3:AbortMultipartUpload",
        "s3:GetBucketLocation",
        "s3:GetObject",
        "s3:ListBucket",
        "s3:PutObject",
      ]
      Resource = [
        aws_s3_bucket.raw[0].arn,
        "${aws_s3_bucket.raw[0].arn}/*",
      ]
    }]
  })
}

resource "aws_kinesis_firehose_delivery_stream" "cold" {
  count       = var.enabled ? 1 : 0
  name        = "${var.name_prefix}-${var.firehose_stream_suffix}"
  destination = "extended_s3"

  extended_s3_configuration {
    role_arn   = aws_iam_role.firehose[0].arn
    bucket_arn = aws_s3_bucket.raw[0].arn
    prefix     = "cold-stream-events/year=!{timestamp:yyyy}/month=!{timestamp:MM}/day=!{timestamp:dd}/"
    error_output_prefix = "errors/firehose/cold-stream-events/year=!{timestamp:yyyy}/month=!{timestamp:MM}/day=!{timestamp:dd}/!{firehose:error-output-type}/"
    buffering_size     = 128
    buffering_interval = 900
  }

  tags = var.tags
}

resource "aws_glue_catalog_database" "analytics" {
  count = var.enabled ? 1 : 0
  name  = var.glue_database_name
}

output "s3_bucket_name" {
  value = var.enabled ? aws_s3_bucket.raw[0].bucket : null
}

output "s3_bucket_arn" {
  value = var.enabled ? aws_s3_bucket.raw[0].arn : null
}

output "firehose_stream_name" {
  value = var.enabled ? aws_kinesis_firehose_delivery_stream.cold[0].name : null
}

output "firehose_stream_arn" {
  value = var.enabled ? aws_kinesis_firehose_delivery_stream.cold[0].arn : null
}

output "glue_database_name" {
  value = var.enabled ? aws_glue_catalog_database.analytics[0].name : null
}
