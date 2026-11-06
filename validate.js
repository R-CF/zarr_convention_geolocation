import Ajv2020 from "ajv/dist/2020.js";
import fs from "fs";

// Read command line arguments
const schemaPath = process.argv[2];
const dataPath = process.argv[3];

if (!schemaPath || !dataPath) {
  console.error("Usage: node validate.js <schema.json> <data.json>");
  process.exit(1);
}

const ajv = new Ajv2020({ allErrors: true });

// The proj: schema is draft-07. Ajv resolves $ref only within one instance, so
// it is relabelled as 2020-12 and added to the single instance below
const proj = await fetch("https://raw.githubusercontent.com/zarr-conventions/proj/refs/tags/v0.1/schema.json")
  .then(r => r.json());

// Fetch and add external schemas by their URL
const externalSchemas = [
  "https://raw.githubusercontent.com/R-CF/zarr_convention_ref/refs/tags/v2.0.0/schema.json"
];

for (const url of externalSchemas) {
  const schema = await fetch(url).then(r => r.json());
  // Pass the URL as explicit key to handle any $id mismatch
  ajv.addSchema(schema, url);
}

// Relabelling is sound only because #/$defs/projAttributes, the part referenced
// from schema.json, uses no keywords whose meaning changed after draft-07
// (array-form "items", "additionalItems", "dependencies", siblings of "$ref").
// Re-check this when moving to a new proj: version.
const projCompat = { ...proj, $schema: "https://json-schema.org/draft/2020-12/schema" };
ajv.addSchema(projCompat);

// PROJJSON schema is also in draft-07. Local copy made and converted to 2020-12
const projJson = JSON.parse(fs.readFileSync("projjson.schema.json", "utf8"));
ajv.addSchema(projJson, "https://proj.org/schemas/v0.7/projjson.schema.json");

// Read files
const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));

// Validate
const validate = ajv.compile(schema);
const valid = validate(data);

if (valid) {
  console.log("✅ Validation successful!");
  process.exit(0);
} else {
  console.log("❌ Validation failed!");
  console.log(JSON.stringify(validate.errors, null, 2));
  process.exit(1);
}
