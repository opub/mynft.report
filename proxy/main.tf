terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.2.0"
    }
  }
  required_version = ">= 1.0"
}

provider "aws" {
  profile = var.aws_profile
  region  = var.aws_region
}

data "aws_caller_identity" "current" {}

locals {
  account = data.aws_caller_identity.current.account_id
}
