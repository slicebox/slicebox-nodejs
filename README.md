# slicebox-nodejs
Simple example web application using slicebox as a service for storage, indexing and access to DICOM images. The example
shows how to integrate a NodeJs + Express application with slicebox using the Request.js middleware as serverside REST
client.

This minimal demo of integration has the following features
* Federated login using Google (must have Google account to login)
* Upload of multiple images. Images is tied to login using the slicebox concept of import sessions
* Browsing available data for logged in user. The UI shows a tree structure of patients, studies and series
* Display of PNG representations of image slices

Keep a slicebox instance with some images running at localhost port 5000 with user admin/admin available.