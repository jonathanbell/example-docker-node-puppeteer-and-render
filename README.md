# Example Express and Node on Docker

An example [Docker](https://www.docker.com/), [Node](https://nodejs.org/en/) and Express app.

## Local installation and development

1. `cd <project-root>`
1. `cp .env.example .env`
1. Add the appropriate environment variables to `.env`
1. `npm i`
1. Use `docker-compose` for local development: `DOCKER_BUILDKIT=0 docker compose -f docker-compose.dev.yml up --build`
    - [We need `DOCKER_BUILDKIT=0` on M1 Macs.](https://github.com/docker/compose/issues/8449)
    - The app will now be running: <http://localhost:3000/>

`docker ps` will show all running containers.

You can stop the container with: `docker stop <name of container>` ex. `docker stop clandestine-crawler`

### Connecting to the Docker container

In order to SSH into the container use: `docker exec -it clandestine-crawler bash` (where `clandestine-crawler` is the container name)

### Building and running the image manually (for deployment)

If you'd like to preview a release build, follow these instructions.

1. `DOCKER_BUILDKIT=0 docker build -t ff-crawler --target production .`
    - (leave off the `production` target to build all layers)
1. Optional: if you'd like to run the image in a container, you can do that now by creating a container (`clandestine-crawler`) and mapping port 3000 from the host to the container: `docker run -d -p 3000:3000 --name clandestine-crawler ff-crawler`
    - The app will now be running: <http://localhost:3000/>

### Connecting to the Maria database

There is a local database available for use in development (when you run `docker compose` using the development file). To connect to it, ensure that `MARIADB_ROOT_PASSWORD=root` is set in your `.env` file and use port `3309` on `127.0.0.1`.

### Running tests

Build the test container: `DOCKER_BUILDKIT=0 docker build -t ff-crawler-test --target test .`

Run the test container: `docker run -it --rm -p 3000:3000 ff-crawler-test`
