output "name_prefix" {
  value = "${var.project_name}-${var.environment}"
}

output "lambda_function_names" {
  value = merge(
    module.ingress.lambda_function_names,
    module.batch.lambda_function_names,
    module.ml.lambda_function_names,
  )
}

output "kinesis_stream_names" {
  value = module.ingress.kinesis_stream_names
}

output "analytics_lake" {
  value = {
    s3_bucket_name       = module.analytics_lake.s3_bucket_name
    firehose_stream_name = module.analytics_lake.firehose_stream_name
    glue_database_name   = module.analytics_lake.glue_database_name
  }
}
