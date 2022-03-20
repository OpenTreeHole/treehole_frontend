# Open Tree Hole Front End

Frontend of OpenTreeHole ---- Anonymous BBS for college students

## Features

- White-listed registration ---- for certain community like college students
- Anonymous: RSA encrypted personal information(email) and random identity
- Compliance: report, mute, ban, fold NSFW contents
- Push notifications: web(websocket), iOS and Android
- Balance between performance and development efficiency: stress test 300~400 qps

## Install

This installation is just for frontend program. If you want to deploy the whole OpenTreeHole project, please visit [Deploy Repo](https://github.com/OpenTreeHole/deploy).

This project continuously integrates with docker. Go check it out if you don't have docker locally installed.

```shell
docker run -d -p 80:80 shi2002/open_tree_hole_frontend
```

## Badge

[![dev build](https://github.com/OpenTreeHole/vue/actions/workflows/dev.yml/badge.svg)](https://github.com/OpenTreeHole/vue/actions/workflows/dev.yml)

[![docker](https://github.com/OpenTreeHole/vue/actions/workflows/docker-master.yaml/badge.svg)](https://github.com/OpenTreeHole/vue/actions/workflows/docker-master.yaml)

[![dev docker](https://github.com/OpenTreeHole/vue/actions/workflows/docker-dev.yaml/badge.svg)](https://github.com/OpenTreeHole/vue/actions/workflows/docker-dev.yml)

## Contributing

Feel free to dive in! [Open an issue](https://github.com/OpenTreeHole/vue/issues/new) or submit PRs.

### Development

Getting Started: https://www.github.com/OpenTreeHole/Getting-Started/Getting-Started.md

```shell
# Clone the repository
git clone https://www.github.com/OpenTreeHole/vue.git
cd vue
# Install Dependencies
npm install # (Or yarn)
# Run The Dev Server
npm run serve # (Or yarn run serve)
```

To build the project, run
```shell
npm run build # (Or yarn run build)
# 'npm run build-report' can build the project with a report.html in the root directory.
```

### Contributors

This project exists thanks to all the people who contribute.

<a href="https://github.com/OpenTreeHole/vue/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=OpenTreeHole/vue" />
</a>

## Licence

[![license](https://img.shields.io/github/license/OpenTreeHole/vue)](https://github.com/OpenTreeHole/vue/blob/dev/LICENSE)
© OpenTreeHole
