# Install Ubuntu Dependencies
FROM ubuntu:18.04
ARG UBUNTU_PACKAGES="\
    git \
    golang-go \
    python3 \
    python3-pip \
    vim \
"
RUN apt-get update && apt-get install -y ${UBUNTU_PACKAGES}

# Install Python Dependencies
# ARG PIP3_PACKAGES="\
#     APScheduler==3.7.0 \ 
#     beautifulsoup4==4.9.3 \
#     discord==1.0.1 \
#     mechanize==0.4.5 \
#     pytest==6.2.2 \
#     tweepy==3.10.0 \
# "
# RUN pip3 install ${PIP3_PACKAGES}


# Clone GitHub Repo and Bot Units
RUN git clone https://github.com/Atemosta/FEH-Gauntlet-Bot

# Create Shell Script for Running PyTest
RUN pip3 install -r FEH-Gauntlet-Bot/Deployment/requirements.txt
RUN echo "cd FEH-Gauntlet-Bot/Deployment && pytest" > run_docker_tests.sh && chmod u+x run_docker_tests.sh

# COPY . /app
# RUN make /app
# CMD python /app/app.py

# Step 0: Get an CNAME (namecheap is great) and import it to cloudflare
# Step 1: Install NVM (https://linuxize.com/post/how-to-install-node-js-on-ubuntu-18.04/)
# Step 2: Install Wrangler (https://github.com/cloudflare/wrangler)
# Step 3: `wrangler login` or `wrangler config` (https://dash.cloudflare.com/profile/api-tokens) (MAKE SURE YOU HAVE CREATED A SUBDOMAIN via https://dash.cloudflare.com/sign-up/workers)
# Step 3a: tutorial for wrangler config
# Step 3b: npm i (nvm install 14.16.0 -> nvm use 14.16.0)
# Step 3c: npm run deploy (make sure to FULLY integrate cloudflare account) (workers.api.error.script_not_found -> waiting 48 hours for cloudflare to process)
# Step 4: Install Serverless (https://github.com/serverless/components#quick-start)
# Step 4a: npm i -g serverless
# Step 4b: serverless login (how to do in Docker?)
# Step 4c: npm i
# Step 4d: npm run deploy (go through manual UI and make an express project that matches the params in serverless.yml )
