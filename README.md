# Geolocation Convention

- **UUID**: bb9ee930-8c60-4c47-ad6b-8daa558987ed
- **Name**: Geolocation
- **Schema URL**: "https://raw.githubusercontent.com/R-CF/zarr_convention_geolocation/main/schema.json"
- **Spec URL**: "https://raw.githubusercontent.com/R-CF/zarr_convention_geolocation/main/README.md"
- **Scope**: Array, Group
- **Extension Maturity Classification**: Proposal
- **Owner**: @pvanlaake

## Description

Some geospatial data sets do not have a simple coordinate reference system. A typical example would be a level-1 swath satellite image. Such data sets may have ancillary data structures to provide the geolocation data for the elements in the image, one array for each of longitude and latitude. This convention provides a standard mechanism to refer to such geolocation arrays from the data arrays whose coordinates need to be determined.

Examples of the use of geolocation arrays in gridded products are:

- **MODIS satellite imagery**: MODIS level-1 images are distributed in so-called 5-minute swaths: sensor line and path observations over 5 minutes of time, using an instrument pixel indexing scheme. The MODIS Geolocation product (MOD03) contains geodetic coordinates and various other variables for the center of each 1-km pixel at nadir.
- **VIIRS (Suomi NPP / NOAA-20)**: Similar to the MODIS approach, VIIRS uses separate geolocation products (VNP03MOD) per resolution tier.
- **Sentinel-3 OLCI**: In the SAFE format, the Sentinel-3 EO L1B Product package includes files `geo_coordinates.nc` with `latitude` and `longitude` variables that hold the geolocation arrays for the radiance variables. A down-scaled version of the geolocation arrays is provided in the `tie_geo_coordinates.nc` file of the package. In the newer EOPF format based on Zarr, the `/measurements` top-level group contains `latitude` and `longitude` arrays with the geolocation data for those arrays that do not define their own coordinate system through coordinate variables.
- **CORDEX**: The regionally down-scaled climate projection data from CORDEX uses a "rotated pole" coordinate system for which there are no standard coordinate reference systems. Data is stored in netCDF format using the CF Metadata Conventions, which provides for storage of geolocation arrays alongside the scientific data variable (see below).
- **Ocean modeling data**: Ocean modeling data (e.g. ROMS) commonly uses a tailor-made tripolar grid, placing two "north" poles over North American and Asian landmasses to avoid numerical singularities when modeling mass fluxes at or near the North Pole. As with CORDEX data, the netCDF format is used for data storage with geolocation arrays stored in the same file.

The CF Metadata Conventions define a convention for storing geolocation arrays in netCDF files. For scientific data variables with a "horizontal grid that was not defined as a Cartesian product of latitude and longitude axes" the conventions are ["using two-dimensional coordinate variables" of latitude and longitude](https://cfconventions.org/cf-conventions/cf-conventions.html#_two_dimensional_latitude_longitude_coordinate_variables). This convention applies a similar construct to store geolocation data as Zarr arrays.

In the GeoZarr ecosystem, this convention can be used as a complement to the [`spatial:`](https://github.com/zarr-conventions/spatial) and [`cs`](https://github.com/R-CF/zarr_conventions_cs) conventions to provide geolocation information where a simple coordinate system is not provided for the Zarr array.

## Motivation

The principal motivation for this convention is to have a consistent and explicit treatment of geolocation arrays such that application developers can easily access the data for interpretation.

## Convention Registration

The convention must be registered in `zarr_conventions`:

```json
{
  "zarr_conventions": [
    {
      "schema_url": "https://raw.githubusercontent.com/R-CF/zarr_convention_geolocation/main/schema.json",
      "spec_url": "https://raw.githubusercontent.com/R-CF/zarr_convention_geolocation/main/README.md",
      "uuid": "bb9ee930-8c60-4c47-ad6b-8daa558987ed",
      "name": "geolocation",
      "description": "Convention for storing geolocation arrays"
    }
  ]
}
```

## Applicable To

This convention can be used with these parts of the Zarr hierarchy:

- [x] Group
- [x] Array

## Properties

This convention uses a single property. The property may be placed as appropriate, following the pattern of the `spatial:` or `cs` convention that is used to provide the coordinates of the object.

| Field Name  | Type  | Description                       |
| ----------- | ----- | --------------------------------- |
| geolocation | [ref] | Mandatory. Array of `ref` objects |

### geolocation
The `geolocation` field is a JSON array of [ref](https://github.com/R-CF/zarr_convention_ref) objects, with each element of the array indicating a Zarr array that provides the geolocation data for a coordinate in the Zarr array shape. Typically, only the `node` field of the `ref` object will be used, but the `uri` field may be used to identify an external Zarr store that provides the geolocation arrays.

The order of the elements in the JSON array is significant: it must be the same as in the object that this object is associated with:

- **`spatial:`**: The order in the array must follow the order in the `spatial:dimensions` field. The field should be placed at the same level as the `spatial:dimensions` field, which is usually the top-level under `attributes`.
- **`cs`**: The order in the array must follow the order in the `crs` object. Effectively, the `crs` object must describe a 2D or 3D geospatial CRS (and not a vertical or temporal CRS). The `geolocation` field is an object of the `crs` field of the `cs` convention.

##Examples

## Known Implementations

### Libraries and Tools

- **[Coordinate Set Convention](https://github.com/R-CF/zarr_conventions_cs)** - GeoZarr convention for coordinate sets
  - Language: JSON
  - Status: Proposal
  - Maintainer: @pvanlaake
  - Since: 2026-05-08

_If you implement or use this convention, please add your implementation to this list by submitting a pull request._

## Acknowledgements

This template is based on the [STAC extensions template](https://github.com/stac-extensions/template/blob/main/README.md).
