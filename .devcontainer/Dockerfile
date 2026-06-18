# Dev-Container-Image für template
# RUBY_VERSION muss zu .ruby-version und Gemfile passen
ARG RUBY_VERSION=3.4.4
FROM registry.docker.com/library/ruby:${RUBY_VERSION}-slim

# Pakete für Rails, Postgres-Client, ActiveStorage (libvips) und Claude Code (Node.js)
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
      build-essential git libpq-dev libvips libyaml-dev pkg-config curl postgresql-client && \
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install --no-install-recommends -y nodejs && \
    npm install -g @anthropic-ai/claude-code && \
    rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/*

WORKDIR /rails

# Gems vorab installieren (Layer-Cache). Der Quellcode wird zur Laufzeit per Volume
# nach /rails gemountet; die Gems liegen außerhalb davon unter /usr/local/bundle.
COPY Gemfile Gemfile.lock ./
RUN bundle install
