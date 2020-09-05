# Intermediate Software Project #4: Cannon

Fourth project developed in Intermediate Software Project Course using ASP.Net with Visual Studio.

A Release is available to download and install to run a local instance of the web app.

Alternatively, the project is available on [Docker Hub](https://hub.docker.com/r/pedanticprogrammer/cannon).

If intending to access the web app through a subfolder, it is necessary to add filters to properly map resources.

Example of cannon subfolder in Nginx 

    sub_filter 'src="/'   'src="/cannon/';
    sub_filter 'href="/'  'href="/cannon/';
    sub_filter_once on;
