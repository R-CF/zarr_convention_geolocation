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
- **Sentinel-3 OLCI**: In the **SAFE format**, the Sentinel-3 EO L1B Product package includes files `geo_coordinates.nc` with `latitude` and `longitude` variables that hold the geolocation arrays for the radiance variables. A down-scaled version of the geolocation arrays is provided in the `tie_geo_coordinates.nc` file of the package. In the newer **EOPF format** for level-1 and level-2 data based on Zarr, the top-level groups contain `latitude` and `longitude` and/or `x` and `y` arrays with the geolocation data for those arrays, in geodetic latitude and longitude or projected coordinates, respectively, as the arrays do not define their own coordinate system through coordinate variables.
- **CORDEX**: The regionally down-scaled climate projection data from CORDEX uses a "rotated pole" coordinate system for which there are no standard coordinate reference systems. Data is stored in netCDF format using the CF Metadata Conventions, which provides for storage of geolocation arrays alongside the scientific data variable (see below).
- **Ocean modeling data**: Ocean modeling data (e.g. ROMS) commonly uses a tailor-made tripolar grid, placing two "north" poles over North American and Asian landmasses to avoid numerical singularities when modeling mass fluxes at or near the North Pole. As with CORDEX data, the netCDF format is used for data storage with geolocation arrays stored in the same file.

The CF Metadata Conventions define a convention for storing geolocation data in netCDF files. For scientific data variables with a "horizontal grid that was not defined as a Cartesian product of latitude and longitude axes" the conventions are ["using two-dimensional coordinate variables" of latitude and longitude](https://cfconventions.org/cf-conventions/cf-conventions.html#_two_dimensional_latitude_longitude_coordinate_variables). This convention applies a similar construct to store geolocation data as Zarr arrays.

In the GeoZarr ecosystem, this convention can be used as a complement to the [`spatial`](https://github.com/zarr-conventions/spatial) and [`cs`](https://github.com/R-CF/zarr_conventions_cs) conventions to provide geolocation information where a simple coordinate system is not provided for the Zarr array.

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

This convention groups all fields nested in a single property. The property may be placed as appropriate, following the pattern of the `spatial:` or `cs` convention that is used to provide the coordinates of the object.

| Field Name  | Type   | Description                               | Required |
| ----------- | ------ | ----------------------------------------- | -------- |
| geolocation | [Geolocation object](#geolocation-object) | The geolocation object | Yes |

### Geolocation object

The geolocation object contains references to geodetic and/or planar coordinate values in some coordinate system. At least one of the two MUST be given.

| Field Name | Type         | Description                     | Required    |
| ---------- | ------------ | ------------------------------- | ----------- |
| geodetic   | [Arrays object](#arrays-object) | Object for geodetic geolocation | Conditional |
| planar     | [Arrays object](#arrays-object) | Object for planar geolocation   | Conditional |

#### geodetic
This field contains an object holding two geolocation arrays giving geodetic coordinates.

#### planar
This field contains an object holding two geolocation arrays giving planar coordinates.

### Arrays object

| Field Name | Type        | Description                         | Required |
| ---------- | ----------- | ----------------------------------- | -------- |
| x          | ref object  | Reference to an array of x values   | Yes      |
| y          | ref object  | Reference to an array of y values   | Yes      |
| crs        | proj object | CRS description of the values       | No       |

#### x / y
The `x` and `y` fields are [ref](https://github.com/R-CF/zarr_convention_ref) objects, referencing an array providing the X (west-east) axis coordinates and the the Y (south-north) axis coordinates, respectively. When the key to the object is `"geodetic"`, the `x` and `y` arrays represent longitude and latitude values, respectively. For the `"planar"` case, the values are formally identified by the properties of the `"id"` field, usually planar `x` and `y` values in a coordinate reference system.

Typically, only the `node` field of the `ref` object will be used for an in-store reference, but the `uri` field may be used to identify an external Zarr store that provides the geolocation array.

#### crs
The description of the CRS, encoded using the [`proj` convention](https://github.com/zarr-conventions/geo-proj). This field SHOULD be included if a coordinate reference system identifier describing the data in the geolocation arrays is known.

The field must describe a coordinate reference system that agrees with the `"x"` and `"y"` arrays. If the arrays are geodetic, the field must describe a geodetic coordinate reference system; for planar coordinates, the coordinate reference system may be derived, projected, or engineering.

## Examples
**Example 1: Geodetic geolocation arrays in the same group as the array**
```
{
  "zarr_format": 3,
  "node_type": "array",
  "shape": [8605, 180, 288],
  "dimension_names": ["time", "y", "x"],
  "attributes": {
    "zarr_conventions": [
      {
        "schema_url": "https://raw.githubusercontent.com/R-CF/zarr_convention_geolocation/main/schema.json",
        "name": "geolocation"
      },
      {
        "schema_url": "https://raw.githubusercontent.com/R-CF/zarr_convention_ref/main/schema.json",
        "name": "ref"
      },
      {
        "schema_url": "https://raw.githubusercontent.com/zarr-conventions/geo-proj/main/schema.json",
        "name": "proj"
      }
    ],
    "geolocation": {
      "geodetic": {
        "x": {
          "node": "longitude"
        },
        "y": {
          "node": "latitude"
        },
        "id": {
          "proj:code": "EPSG:4326"
        }
      }
    }
  }
}
```
**Example 2: Geodetic and planar geolocation arrays, in different groups referenced relative to the group of this array**
```
{
  "zarr_format": 3,
  "node_type": "array",
  "shape": [8605, 180, 288],
  "dimension_names": ["time", "y", "x"],
  "attributes": {
    "zarr_conventions": [
      {
        "schema_url": "https://raw.githubusercontent.com/R-CF/zarr_convention_geolocation/main/schema.json",
        "name": "geolocation"
      },
      {
        "schema_url": "https://raw.githubusercontent.com/R-CF/zarr_convention_ref/main/schema.json",
        "name": "ref"
      },
      {
        "schema_url": "https://raw.githubusercontent.com/zarr-conventions/geo-proj/main/schema.json",
        "name": "proj"
      }
    ],
    "geolocation": {
      "geodetic": {
        "x": {
          "node": "../geolocation/geodetic/longitude"
        },
        "y": {
          "node": "../geolocation/geodetic/latitude"
        },
        "id": {
          "proj:code": "EPSG:4326"
        }
      },
      "planar": {
        "x": {
          "node": "../geolocation/UTM28N/easting"
        },
        "y": {
          "node": "../geolocation/UTM28N/northing"
        },
        "id": {
          "proj:code": "EPSG:25828"
        }
      }
    }
  }
}
```

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
