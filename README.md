# Geolocation Convention

- **UUID**: bb9ee930-8c60-4c47-ad6b-8daa558987ed
- **Name**: geolocation
- **Schema URL**: "https://raw.githubusercontent.com/R-CF/zarr_convention_geolocation/refs/tags/v2.0.0/schema.json"
- **Spec URL**: "https://github.com/R-CF/zarr_convention_geolocation/blob/v2.0.0/README.md"
- **Scope**: Array, Group
- **Extension Maturity Classification**: Pilot
- **Owner**: @pvanlaake

## Description

Some geospatial data sets have a coordinate system that lacks a simple mapping to a coordinate reference system. A typical example would be a level-1 swath satellite image. Such data sets may have ancillary data structures to provide the geolocation data for the elements in the image, one array for each of longitude and latitude. This convention provides a standard mechanism to refer to such geolocation arrays from the data arrays whose coordinates need to be determined, both for geodetic (latitude-longitude) coordinates and planar (projected) coordinates.

Examples of the use of geolocation arrays in gridded products are:

- **MODIS satellite imagery**: MODIS level-1 images are distributed in so-called 5-minute swaths: sensor line and path observations over 5 minutes of time, using an instrument pixel indexing scheme. The MODIS Geolocation product (MOD03) contains geodetic coordinates (and various other variables) for the center of each 1-km pixel at nadir.
- **VIIRS (Suomi NPP / NOAA-20)**: Similar to the MODIS approach, VIIRS uses separate geolocation products (VNP03MOD) per resolution tier.
- **Sentinel-3 OLCI**: In the **SAFE format**, the Sentinel-3 EO L1B Product package includes files `geo_coordinates.nc` with `latitude` and `longitude` variables that hold the geolocation arrays for the radiance variables. A down-scaled version of the geolocation arrays is provided in the `tie_geo_coordinates.nc` file of the package. In the newer **EOPF format** for level-1 and level-2 data based on Zarr, the top-level groups contain `latitude` and `longitude` and/or `x` and `y` arrays with the geolocation data for those arrays, in geodetic latitude and longitude or projected coordinates, respectively, as the arrays do not define their own coordinate system through coordinate variables.
- **CORDEX**: The regionally down-scaled climate projection data from CORDEX uses a "rotated pole" coordinate system for which there are no standard coordinate reference systems. Data is stored in netCDF format using the CF Metadata Conventions, which provides for storage of geolocation arrays alongside the scientific data variable (see below).
- **Ocean modeling data**: Ocean modeling data (e.g. ROMS) commonly uses a tailor-made tripolar grid, placing two "north" poles over North American and Asian landmasses to avoid numerical singularities when modeling mass fluxes at or near the North Pole. As with CORDEX data, the netCDF format is used for data storage with geolocation arrays stored in the same file.

The CF Metadata Conventions define a convention for storing geolocation data in netCDF files. For scientific data variables with a "horizontal grid that was not defined as a Cartesian product of latitude and longitude axes" the conventions are ["using two-dimensional coordinate variables" of latitude and longitude](https://cfconventions.org/cf-conventions/cf-conventions.html#_two_dimensional_latitude_longitude_coordinate_variables). This convention applies a similar construct to store geolocation data as Zarr arrays.

The `geolocation` object describes a mapping from the coordinate system of the current CRS of the Zarr array into a geodetic or planar CRS, expressed as arrays of geographic or planar coordinates, respectively, for each element of the Zarr array. The current CRS need not itself be geodetic; the geolocation arrays provide the derived geodetic or planar coordinates that allow tools to locate array elements on Earth without requiring knowledge of the source coordinate system.

In the GeoZarr ecosystem, this convention can be used as a complement to the [`spatial`](https://github.com/zarr-conventions/spatial) and [`cs`](https://github.com/R-CF/zarr_conventions_cs) conventions to provide geolocation information where a simple coordinate system is not provided for the Zarr array.

## Motivation

The principal motivation for this convention is to have a consistent and explicit treatment of geolocation arrays such that application developers can easily access the data for interpretation.

## Convention Registration

The convention must be registered in `zarr_conventions`:

```json
{
  "zarr_conventions": [
    {
      "schema_url": "https://raw.githubusercontent.com/R-CF/zarr_convention_geolocation/refs/tags/v2.0.0/schema.json",
      "spec_url": "https://github.com/R-CF/zarr_convention_geolocation/blob/v2.0.0/README.md",
      "uuid": "bb9ee930-8c60-4c47-ad6b-8daa558987ed",
      "name": "geolocation",
      "description": "Convention for storing geolocation arrays"
    }
  ]
}
```

## Versioning

Releases of this convention use [semantic versioning](https://semver.org/) in the form `MAJOR.MINOR.PATCH`. Each release is tagged in the repository as `vMAJOR.MINOR.PATCH`, and the `schema_url` and `spec_url` of a release include that tag. The `uuid` identifies the convention independently of its version and never changes.

- A `MAJOR` version changes the structure or meaning of the convention such that metadata that is valid under the previous version may be invalid or be interpreted differently.
- A `MINOR` version adds optional fields or capabilities, or specifies behaviour that the previous version left undefined. Metadata that relied on undefined behaviour may need to be updated to conform to the new minor version.
- A `PATCH` version clarifies the text or corrects errors in the specification, schema or examples, without changing the requirements of the convention.

Implementations SHOULD accept metadata of any version with the same `MAJOR` version as the version they implement. The schema accepts the `schema_url` and `spec_url` of any release within the same `MAJOR` version.

## Applicable To

This convention can be used with these parts of the Zarr hierarchy:

- [x] Group
- [x] Array

## Properties

This convention groups all fields nested in a single property. The property may be placed as appropriate, following the pattern of the convention that is used to provide the coordinates of the object. For the `spatial` convention the `geolocation` field will be located at the top-level, alongside the `spatial:` attributes; for the `cs` convention, the `geolocation` field is nested inside its structure.

This convention MUST be used together with a principal convention that identifies the `X` and `Y` dimensions of the array, such as `spatial` or `cs`.

With the `cs` convention, the `geolocation` field may be part of a `crs` object that is defined in a group, so that it may be shared by multiple arrays. This convention MUST then be registered in that group, and the `ref` objects in the `x` and `y` fields are resolved relative to that group, as for any reference in a `crs` object defined in a group.

| Field Name  | Type   | Description                               | Required |
| ----------- | ------ | ----------------------------------------- | -------- |
| geolocation | [Geolocation object](#geolocation-object) | The geolocation object | No |

### Geolocation object

The geolocation object contains references to geodetic and/or planar coordinate values in some coordinate system. At least one of the two MUST be given.

| Field Name | Type         | Description                     | Required    |
| ---------- | ------------ | ------------------------------- | ----------- |
| geodetic   | [Arrays object](#arrays-object) | Object for geodetic geolocation | Conditional |
| planar     | [Arrays object](#arrays-object) | Object for planar geolocation   | Conditional |

#### geodetic
This field contains an object referencing two geolocation arrays giving geodetic coordinates, and optionally their boundary arrays.

#### planar
This field contains an object referencing two geolocation arrays giving planar coordinates, and optionally their boundary arrays.

### Arrays object

| Field Name | Type                                      | Description                          | Required |
| ---------- | ----------------------------------------- | ------------------------------------ | -------- |
| x          | [Coordinate object](#coordinate-object)   | The x coordinates and their boundaries   | Yes  |
| y          | [Coordinate object](#coordinate-object)   | The y coordinates and their boundaries   | Yes  |
| id         | proj object                               | CRS description of the values        | No       |

#### x / y
The `x` and `y` fields are coordinate objects for the X (west-east) axis coordinates and the Y (south-north) axis coordinates, respectively. When the key to the object is `geodetic`, the `x` and `y` coordinates represent longitude and latitude values, respectively. For the `planar` case, the values are formally identified by the properties of the `id` field, usually planar `x` and `y` values in a coordinate reference system.

The `boundaries` field MUST be given for both `x` and `y`, or for neither.

### Coordinate object

| Field Name | Type          | Description                                       | Required |
| ---------- | ------------- | ------------------------------------------------- | -------- |
| values     | `ref` object  | Reference to the geolocation array                | Yes      |
| boundaries | `ref` object  | Reference to the array with the cell vertices     | No       |

Both fields are [ref](https://github.com/R-CF/zarr_convention_ref/blob/v2.0.0/README.md) objects. Unlike the `values` and `boundaries` objects of the `cs` convention, there is no `external` level: geolocation arrays and their boundary arrays are always stored in external Zarr arrays. Typically, only the `node` field of the `ref` object will be used for an in-store reference, but the `uri` field may be used to identify an external Zarr store that provides the array.

Attributes that describe the coordinate values, such as `units`, `standard_name` or `long_name`, are stored as attributes of the referenced arrays themselves; this convention does not define them.

#### values
The geolocation arrays referenced in the `values` fields of `x` and `y` MUST have `dimension_names` in their metadata. Geolocation arrays are matched to the referring array (i.e. the array that uses these geolocation arrays to associate coordinates with its elements) by dimension name: the names of the `X` and `Y` dimensions of the referring array, as identified by the principal convention (`spatial:dimensions` for the `spatial` convention, the axes with abbreviation `X` and `Y` for the `cs` convention), MUST both appear in the `dimension_names` of each geolocation array, and the lengths along those dimensions MUST be equal. The order of the dimensions in a geolocation array need not be the same as in the referring array. Additional dimensions in the geolocation arrays are NOT RECOMMENDED; any additional dimension MUST also appear in the `dimension_names` of the referring array, with equal length.

#### boundaries
This convention applies to regular grids, so every cell has four sides and four vertices. The boundary array referenced in the `boundaries` field MUST have the dimensions of the corresponding `values` array, matched by name and with equal lengths, plus exactly one additional dimension of length 4 that runs over the vertices of each cell. The order of the dimensions is free.

The vertices MUST be ordered such that, when visiting them in order, the perimeter of the cell is traversed anticlockwise in the longitude–latitude plane as viewed from above. When the index space of the `X` and `Y` dimensions of the referring array is right-handed relative to longitude–latitude, this is arranged as follows. For the cell at index *i* along `X` and *j* along `Y`, call the side facing the cell at (*i* − 1, *j*) the "*i* − 1" side, and similarly for the other three sides. The four vertices are then the corners between the *j* − 1 and *i* − 1 sides, the *j* − 1 and *i* + 1 sides, the *j* + 1 and *i* + 1 sides, and the *j* + 1 and *i* − 1 sides, in that order. This follows the CF Metadata Conventions, [section 7.1.2](https://cfconventions.org/cf-conventions/cf-conventions.html#bounds-lat-lon), where Figure 7.2 illustrates the ordering.

#### id
The description of the CRS, encoded using the [`proj` convention](https://github.com/zarr-conventions/proj/blob/v0.1/README.md). This field SHOULD be included if a coordinate reference system identifier describing the data in the geolocation arrays is known.

The field MUST reference or describe a coordinate reference system that agrees with the `x` and `y` arrays. If the arrays are geodetic, the field MUST describe a geodetic coordinate reference system; for planar coordinates, the coordinate reference system may be derived, projected, or engineering.

## Examples
For brevity, the examples omit the principal convention (`spatial` or `cs`) that identifies the `X` and `Y` dimensions of the array.

**Example 1: Geodetic geolocation arrays with cell boundaries, in the same group as the array**
```json
{
  "zarr_format": 3,
  "node_type": "array",
  "shape": [
    8605,
    180,
    288
  ],
  "dimension_names": [
    "time",
    "y",
    "x"
  ],
  "attributes": {
    "zarr_conventions": [
      {
        "schema_url": "https://raw.githubusercontent.com/R-CF/zarr_convention_geolocation/refs/tags/v2.0.0/schema.json",
        "name": "geolocation"
      },
      {
        "schema_url": "https://raw.githubusercontent.com/R-CF/zarr_convention_ref/refs/tags/v2.0.0/schema.json",
        "name": "ref"
      },
      {
        "schema_url": "https://raw.githubusercontent.com/zarr-conventions/proj/refs/tags/v0.1/schema.json",
        "name": "proj"
      }
    ],
    "geolocation": {
      "geodetic": {
        "x": {
          "values": {
            "ref": {
              "node": "../longitude"
            }
          },
          "boundaries": {
            "ref": {
              "node": "../longitude_bnds"
            }
          }
        },
        "y": {
          "values": {
            "ref": {
              "node": "../latitude"
            }
          },
          "boundaries": {
            "ref": {
              "node": "../latitude_bnds"
            }
          }
        },
        "id": {
          "proj:code": "EPSG:4326"
        }
      }
    }
  }
}
```
**Example 2: Geodetic and planar geolocation arrays, in different groups referenced relative to this array**
```json
{
  "zarr_format": 3,
  "node_type": "array",
  "shape": [
    8605,
    180,
    288
  ],
  "dimension_names": [
    "time",
    "y",
    "x"
  ],
  "attributes": {
    "zarr_conventions": [
      {
        "schema_url": "https://raw.githubusercontent.com/R-CF/zarr_convention_geolocation/refs/tags/v2.0.0/schema.json",
        "name": "geolocation"
      },
      {
        "schema_url": "https://raw.githubusercontent.com/R-CF/zarr_convention_ref/refs/tags/v2.0.0/schema.json",
        "name": "ref"
      },
      {
        "schema_url": "https://raw.githubusercontent.com/zarr-conventions/proj/refs/tags/v0.1/schema.json",
        "name": "proj"
      }
    ],
    "geolocation": {
      "geodetic": {
        "x": {
          "values": {
            "ref": {
              "node": "../../geolocation/geodetic/longitude"
            }
          }
        },
        "y": {
          "values": {
            "ref": {
              "node": "../../geolocation/geodetic/latitude"
            }
          }
        },
        "id": {
          "proj:code": "EPSG:4326"
        }
      },
      "planar": {
        "x": {
          "values": {
            "ref": {
              "node": "../../geolocation/UTM28N/easting"
            }
          }
        },
        "y": {
          "values": {
            "ref": {
              "node": "../../geolocation/UTM28N/northing"
            }
          }
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
  - Status: Pilot
  - Maintainer: @pvanlaake
  - Since: 2026-05-08
- **[xarray-zarr-xgroup](https://github.com/pvanlaake/xarray-zarr-xgroup)** - XArray backend for GeoZarr support with cross-group referencing
  - Language: Python
  - Status: Released
  - Maintainer: @pvanlaake
  - Since: 2026-06-15
- **[geozarr](https://cran.r-project.org/package=geozarr)** - R package with a driver for GeoZarr and its conventions
  - Language: R
  - Status: Published on CRAN
  - Maintainer: @pvanlaake
  - Since: 2026-11-06

_If you implement or use this convention, please add your implementation to this list by submitting a pull request._

## Acknowledgements

This template is based on the [STAC extensions template](https://github.com/stac-extensions/template/blob/main/README.md).
