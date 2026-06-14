variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "aws_region" {
  type = string
}

variable "tags" {
  type    = map(string)
  default = {}
}

variable "partition_key_field" {
  type    = string
  default = "device_code"
}

variable "iot" {
  type    = any
  default = {}
}

variable "analytics_lake" {
  type    = any
  default = {}
}

variable "data_plane" {
  type    = any
  default = {}
}

variable "lambda_iam_roles" {
  type    = any
  default = {}
}

variable "lambdas" {
  type = any
}

variable "streams" {
  type    = any
  default = {}
}

variable "batch_schedules" {
  type    = list(any)
  default = []
}

variable "batch_runner_lambda" {
  type    = string
  default = "batch_cadence_runner"
}

variable "ml_triggers" {
  type    = list(any)
  default = []
}
