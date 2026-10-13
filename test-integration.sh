#!/usr/bin/env bash
set -u

# Start customer-service, business-service, and order-service before running this script.
# To verify the 503 path, stop business-service and submit an order: order-service returns ApiError JSON.

tmp=$(mktemp)
trap 'rm -f "$tmp"' EXIT
failures=0
run_id=$$

check_status() {
  local name=$1 expected=$2 actual=$3
  if [[ "$actual" == "$expected" ]]; then echo "PASS: $name"; else echo "FAIL: $name (expected $expected, got $actual)"; failures=$((failures + 1)); fi
}

request() {
  curl -sS -o "$tmp" -w '%{http_code}' "$@"
}

customer_code=$(request -X POST http://localhost:8083/api/customers -H 'Content-Type: application/json' \
  -d "{\"username\":\"integration-$run_id\",\"familyName\":\"Test\",\"givenName\":\"Integration\",\"email\":\"integration-$run_id@example.com\",\"phoneNumber\":\"+85512345678\"}")
check_status 'create customer' 201 "$customer_code"
customer_id=$(sed -n 's/.*"customerId":"\([^"]*\)".*/\1/p' "$tmp")

business_code=$(request -X POST http://localhost:8082/api/businesses -H 'Content-Type: application/json' \
  -d "{\"legalName\":\"Integration Shop LLC\",\"displayName\":\"Integration Shop\",\"email\":\"integration-shop-$run_id@example.com\",\"phoneNumber\":\"+85512345679\",\"products\":[{\"name\":\"Tea\",\"price\":1.25,\"quantity\":10},{\"name\":\"Coffee\",\"price\":2.50,\"quantity\":8}]}")
check_status 'register business with products' 201 "$business_code"
business_id=$(sed -n 's/.*"businessId":"\([^"]*\)".*/\1/p' "$tmp")
product_one=$(sed -n 's/.*"products":\[{"productId":"\([^"]*\)".*/\1/p' "$tmp")
product_two=$(sed -n 's/.*"productId":"\([^"]*\)".*/\1/p' "$tmp")

order_body() {
  local cid=$1 bid=$2 pid=$3 unit_price=$4
  local total=2.50
  [[ "$unit_price" == "2.50" ]] && total=5.00
  printf '{"customerId":"%s","businessId":"%s","address":{"street":"St 271","postalCode":"12000","city":"Phnom Penh"},"price":%s,"items":[{"productId":"%s","quantity":2,"price":%s,"subTotal":%s}]}' \
    "$cid" "$bid" "$total" "$pid" "$unit_price" "$total"
}

order_code=$(request -X POST http://localhost:8081/api/orders -H 'Content-Type: application/json' \
  -d "$(order_body "$customer_id" "$business_id" "$product_one" 1.25)")
check_status 'create order with catalog price' 201 "$order_code"

tampered=$(printf '{"customerId":"%s","businessId":"%s","address":{"street":"St 271","postalCode":"12000","city":"Phnom Penh"},"price":999,"items":[{"productId":"%s","quantity":2,"price":999,"subTotal":999}]}' "$customer_id" "$business_id" "$product_one")
code=$(request -X POST http://localhost:8081/api/orders -H 'Content-Type: application/json' -d "$tampered")
check_status 'tampered item price rejected' 422 "$code"

unknown_business='00000000-0000-0000-0000-000000000001'
body=$(printf '{"customerId":"%s","businessId":"%s","address":{"street":"St 271","postalCode":"12000","city":"Phnom Penh"},"price":2.50,"items":[{"productId":"%s","quantity":2,"price":1.25,"subTotal":2.50}]}' "$customer_id" "$unknown_business" "$product_one")
code=$(request -X POST http://localhost:8081/api/orders -H 'Content-Type: application/json' -d "$body")
check_status 'unknown business not found' 404 "$code"

unknown_customer='00000000-0000-0000-0000-000000000002'
body=$(printf '{"customerId":"%s","businessId":"%s","address":{"street":"St 271","postalCode":"12000","city":"Phnom Penh"},"price":2.50,"items":[{"productId":"%s","quantity":2,"price":1.25,"subTotal":2.50}]}' "$unknown_customer" "$business_id" "$product_one")
code=$(request -X POST http://localhost:8081/api/orders -H 'Content-Type: application/json' -d "$body")
check_status 'unknown customer not found' 404 "$code"

deactivate_customer=$(request -X PATCH "http://localhost:8083/api/customers/$customer_id/deactivate")
check_status 'deactivate customer' 200 "$deactivate_customer"
body=$(printf '{"customerId":"%s","businessId":"%s","address":{"street":"St 271","postalCode":"12000","city":"Phnom Penh"},"price":2.50,"items":[{"productId":"%s","quantity":2,"price":1.25,"subTotal":2.50}]}' "$customer_id" "$business_id" "$product_one")
code=$(request -X POST http://localhost:8081/api/orders -H 'Content-Type: application/json' -d "$body")
check_status 'deactivated customer rejected' 422 "$code"

customer_two_code=$(request -X POST http://localhost:8083/api/customers -H 'Content-Type: application/json' \
  -d "{\"username\":\"integration-business-$run_id\",\"familyName\":\"Test\",\"givenName\":\"Business Check\",\"email\":\"integration-business-$run_id@example.com\",\"phoneNumber\":\"+85512345680\"}")
check_status 'create customer for business status check' 201 "$customer_two_code"
customer_two_id=$(sed -n 's/.*"customerId":"\([^"]*\)".*/\1/p' "$tmp")

deactivate_business=$(request -X PATCH "http://localhost:8082/api/businesses/$business_id/deactivate")
check_status 'deactivate business' 200 "$deactivate_business"
body=$(printf '{"customerId":"%s","businessId":"%s","address":{"street":"St 271","postalCode":"12000","city":"Phnom Penh"},"price":2.50,"items":[{"productId":"%s","quantity":2,"price":1.25,"subTotal":2.50}]}' "$customer_two_id" "$business_id" "$product_one")
code=$(request -X POST http://localhost:8081/api/orders -H 'Content-Type: application/json' -d "$body")
check_status 'deactivated business rejected' 422 "$code"

[[ -n "$product_two" ]] || { echo 'FAIL: second product id missing'; failures=$((failures + 1)); }
if (( failures > 0 )); then exit 1; fi
