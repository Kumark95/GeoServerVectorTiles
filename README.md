# VectorTiles setup

Test project to serve a layer using VectorTiles.

![Vector Tiles](sample_vector_tiles.png)

## Notes:
* Geographic data is located in a Postgres DB with the PostGis extension.
* Geoserver needs to have the VectorTile extension. For version 2.16.4: <https://sourceforge.net/projects/geoserver/files/GeoServer/2.16.4/extensions/>
* The TMS service needs to be active in the GeoWebCache configuration
* The layer needs to have the corresponding formats (MVT, GeoJson, TopoJson) active to enable the integration

## Issues
* Using a style that loads external images for the icons as the default layer style (at the server), causes the features to appear clipped at the edges of the tiles, even when the style rendering is done at the client...
* Using the GeoJson/TopoJson formats, the features does not appear in the map. Even when the request are delivering the point information (json)
