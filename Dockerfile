FROM thinkwhere/geoserver:2.16.4

COPY ./extensions/vector-tiles/*.jar /usr/local/tomcat/webapps/geoserver/WEB-INF/lib/