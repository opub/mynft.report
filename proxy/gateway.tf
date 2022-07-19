resource "aws_apigatewayv2_api" "gateway" {
  name                         = "${var.prefix}gateway"
  protocol_type                = "HTTP"
  disable_execute_api_endpoint = true

  tags = { "Name" = "${var.prefix}gateway" }
}

resource "aws_apigatewayv2_stage" "gateway" {
  api_id = aws_apigatewayv2_api.gateway.id
  name        = "${var.prefix}gateway"
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.gateway.arn

    format = jsonencode({
      requestId               = "$context.requestId"
      sourceIp                = "$context.identity.sourceIp"
      requestTime             = "$context.requestTime"
      protocol                = "$context.protocol"
      httpMethod              = "$context.httpMethod"
      resourcePath            = "$context.resourcePath"
      routeKey                = "$context.routeKey"
      status                  = "$context.status"
      responseLength          = "$context.responseLength"
      integrationErrorMessage = "$context.integrationErrorMessage"
      }
    )
  }
}

resource "aws_apigatewayv2_integration" "gateway" {
  api_id = aws_apigatewayv2_api.gateway.id
  integration_uri    = aws_lambda_function.proxy.invoke_arn
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
}

resource "aws_apigatewayv2_api_mapping" "gateway" {
  api_id      = aws_apigatewayv2_api.gateway.id
  stage       = aws_apigatewayv2_stage.gateway.id
  domain_name = aws_apigatewayv2_domain_name.proxy.id
}

resource "aws_apigatewayv2_route" "gateway" {
  api_id = aws_apigatewayv2_api.gateway.id
  route_key = "GET /api"
  target    = "integrations/${aws_apigatewayv2_integration.gateway.id}"
}

resource "aws_cloudwatch_log_group" "gateway" {
  name = "/aws/api_gw/${aws_apigatewayv2_api.gateway.name}"
  retention_in_days = 30
}

resource "aws_lambda_permission" "gateway" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.proxy.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn = "${aws_apigatewayv2_api.gateway.execution_arn}/*/*"
}
