# top level hosted zone that must exist before running terraform
data "aws_route53_zone" "zone" {
  name         = var.zone
  private_zone = false
}

resource "aws_acm_certificate" "proxy" {
  domain_name       = var.domain
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name   = "${var.prefix}certificate",
    Domain = var.domain
  }
}

resource "aws_route53_record" "validation" {
  zone_id = data.aws_route53_zone.zone.zone_id
  name    = tolist(aws_acm_certificate.proxy.domain_validation_options)[0].resource_record_name
  type    = tolist(aws_acm_certificate.proxy.domain_validation_options)[0].resource_record_type
  records = [tolist(aws_acm_certificate.proxy.domain_validation_options)[0].resource_record_value]
  ttl     = 60
}

resource "aws_acm_certificate_validation" "validation" {
  certificate_arn         = aws_acm_certificate.proxy.arn
  validation_record_fqdns = aws_route53_record.validation.*.fqdn
}

resource "aws_apigatewayv2_domain_name" "proxy" {
  domain_name = var.domain

  domain_name_configuration {
    certificate_arn = aws_acm_certificate.proxy.arn
    endpoint_type   = "REGIONAL"
    security_policy = "TLS_1_2"
  }

  depends_on = [aws_acm_certificate_validation.validation]
}

resource "aws_route53_record" "proxy" {
  zone_id = data.aws_route53_zone.zone.zone_id
  name    = var.domain
  type    = "A"

  alias {
    name                   = aws_apigatewayv2_domain_name.proxy.domain_name_configuration[0].target_domain_name
    zone_id                = aws_apigatewayv2_domain_name.proxy.domain_name_configuration[0].hosted_zone_id
    evaluate_target_health = false
  }
}
