package main

import (
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"os"
	"strings"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func HandleRequest(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	response := events.APIGatewayProxyResponse{}

	if request.HTTPMethod == "GET" {
		target := targetURL(request)
		log.Printf("INFO target: %v", target)

		resp, err := http.Get(target)
		check(err)
		body, err := ioutil.ReadAll(resp.Body)
		check(err)

		response = events.APIGatewayProxyResponse{Body: string(body), StatusCode: resp.StatusCode}
	} else {
		response = events.APIGatewayProxyResponse{Body: "ERROR: " + request.HTTPMethod + " Method Not Allowed", StatusCode: 405}
	}

	log.Printf("INFO response: %v", response.StatusCode)

	return response, nil
}

func targetURL(request events.APIGatewayProxyRequest) string {
	base := os.Getenv("TARGET") + strings.TrimPrefix(request.Path, os.Getenv("PATH"))

	params := url.Values{}
	for key, value := range request.QueryStringParameters {
		params.Add(key, value)
	}

	return base + params.Encode()
}

func check(err error) {
	if err != nil {
		log.Printf("ERROR: %#v", err)
	}
}

func main() {
	lambda.Start(HandleRequest)
}
