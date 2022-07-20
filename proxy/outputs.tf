output "proxy_url" {
  description = "API Gateway URL for reverse proxy"
  value       = "https://${var.domain}${var.path}"
}
