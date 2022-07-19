package main

import (
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func HandleRequest(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	ApiResponse := events.APIGatewayProxyResponse{}

	if request.HTTPMethod == "GET" {
		ApiResponse = events.APIGatewayProxyResponse{Body: "Success: " + request.HTTPMethod + " Allowed", StatusCode: 200}
	} else {
		ApiResponse = events.APIGatewayProxyResponse{Body: "ERROR: " + request.HTTPMethod + " Method Not Allowed", StatusCode: 405}
	}

	return ApiResponse, nil
}

func main() {
	lambda.Start(HandleRequest)
}
