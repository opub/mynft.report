resource "aws_iam_role" "proxy_lambda" {
  name = "${var.prefix}proxy"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowLambdaToAssumeRole",
      "Effect": "Allow",
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      }
    }
  ]
}
EOF

  tags = { "Name" = "${var.prefix}proxy" }
}

resource "aws_iam_policy" "proxy_lambda" {
  name        = "${var.prefix}proxy"
  path        = "/"
  description = "Grant access to CloudWatch logs"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowLambdaWriteAccessToCloudWatch",
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:${var.aws_region}:${local.account}:*"
    }
  ]
}
EOF

  tags = { "Name" = "${var.prefix}proxy" }
}

resource "aws_iam_role_policy_attachment" "proxy_lambda" {
  role       = aws_iam_role.proxy_lambda.name
  policy_arn = aws_iam_policy.proxy_lambda.arn
}

resource "null_resource" "build" {
    provisioner "local-exec" {
        command = "cd lambda && env GOOS=linux GOARCH=amd64 go build -o bin/proxy"
    }
}

data "archive_file" "proxy" {
  type        = "zip"
  source_file = "lambda/bin/proxy"
  output_path = "lambda/bin/proxy.zip"

  depends_on = [null_resource.build]
}

resource "aws_cloudwatch_log_group" "proxy_lambda" {
  name              = "/aws/lambda/${var.prefix}proxy"
  retention_in_days = 14

  tags = { "Name" = "${var.prefix}proxy" }
}

resource "aws_lambda_function" "proxy" {
  function_name    = "${var.prefix}proxy"
  description      = "Reverse proxy"
  handler          = "proxy"
  filename         = data.archive_file.proxy.output_path
  source_code_hash = data.archive_file.proxy.output_base64sha256
  runtime          = "go1.x"
  role             = aws_iam_role.proxy_lambda.arn

  depends_on = [
    aws_iam_role_policy_attachment.proxy_lambda,
    aws_cloudwatch_log_group.proxy_lambda
  ]

  tags = { "Name" = "${var.prefix}proxy" }
}
