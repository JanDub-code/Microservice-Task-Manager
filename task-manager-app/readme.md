# Getting started

1. Run the whole stack in the folder where `docker-compose.yaml` is located:
```
docker-compose up --build
```

2. Import Keycloak realm from file `realm-export.json` and create user `admin` with role `ADMIN`.

3. Import default data from `seminar 3/structure.json` into database `flight_control` in mongo running on `localhost:27018`

4. All services should be working.