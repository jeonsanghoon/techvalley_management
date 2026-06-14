terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.4"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = var.tags
  }
}

locals {
  name_prefix = "${var.project_name}-${var.environment}"
}

module "ingress" {
  source = "./modules/ingress_stack"

  name_prefix           = local.name_prefix
  aws_region            = var.aws_region
  partition_key_field   = var.partition_key_field
  lambdas               = var.lambdas
  streams               = var.streams
  lambda_iam_roles      = var.lambda_iam_roles
}

module "batch" {
  source = "./modules/batch_stack"

  name_prefix         = local.name_prefix
  aws_region          = var.aws_region
  lambdas             = var.lambdas
  batch_schedules     = var.batch_schedules
  batch_runner_lambda = var.batch_runner_lambda
  lambda_iam_roles    = var.lambda_iam_roles
}

module "ml" {
  source = "./modules/ml_stack"

  name_prefix      = local.name_prefix
  aws_region       = var.aws_region
  lambdas          = var.lambdas
  ml_triggers      = var.ml_triggers
  lambda_iam_roles = var.lambda_iam_roles
}

module "analytics_lake" {
  source = "./modules/analytics_lake_stack"

  enabled                = try(var.analytics_lake.enabled, false)
  name_prefix            = local.name_prefix
  s3_bucket_suffix       = try(var.analytics_lake.s3_bucket_suffix, "tv-analytics-raw")
  firehose_stream_suffix = try(var.analytics_lake.firehose.stream_suffix, var.analytics_lake.firehose_stream_suffix, "cold-stream-events")
  glue_database_name     = try(var.analytics_lake.glue.database_name, var.analytics_lake.glue_database_name, "techvalley_analytics")
  tags                   = var.tags
}
