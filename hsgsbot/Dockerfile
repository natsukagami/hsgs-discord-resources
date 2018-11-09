FROM golang:alpine

WORKDIR /app

COPY . .

RUN apk add --no-cache git gcc musl-dev
RUN go build -o hsgsbot cmd/hsgsbot/main.go

FROM alpine

WORKDIR /app

COPY --from=0 /app/hsgsbot /app/

RUN apk add --no-cache ca-certificates

ENTRYPOINT [ "./hsgsbot" ]