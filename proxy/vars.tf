# Common variables
variable "aws_profile" {
  description = "The AWS profile to authenticate with"
  type        = string
  default       = "default"
}

variable "aws_region" {
  description = "The AWS region to deploy to (e.g. us-east-1)"
  type        = string
  default     = "us-east-1"
}

variable "prefix" {
  description = "The prefix to apply to all AWS resource names to avoid collisions"
  type        = string
  default     = "mynftreport-"
}

variable "zone" {
  description = "The pre-existing DNS zone associated with the API Gateway (e.g. mynft.report)"
  type        = string
  default     = "mynft.report"
}

variable "domain" {
  description = "The FQDN under the zone associated with the API Gateway (e.g. proxy.mynft.report)"
  type        = string
  default     = "proxy.mynft.report"
}

variable "path" {
  description = "The path portion of the requested URL to map to proxy (e.g. /api)"
  type        = string
  default     = "/api"
}

variable "target" {
  description = "The target URL that proxy requests will be forwarded to (e.g. https://example.com/)"
  type        = string
  default     = "https://api-mainnet.magiceden.dev/v2"
}
