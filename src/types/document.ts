
// Specification Extensions 

import { ExternalDocumentationObject, HeaderObject, ParameterObject, PathItemObject, PathsObject, RequestBodyObject, ResponseObject } from "./paths";
import { SchemaObject } from "./schema";
import { SecurityRequirementObject, SecuritySchemeObject } from "./security";

// Any object may carry extra fields whose names start with "x-".
export type Extensions = {
    [key: `x-${string}`]: unknown;
};

// Reference
export type ReferenceObject = {
    $ref: string;
};

export type Ref<T> = T | ReferenceObject;

export const isReference = (value: unknown): value is ReferenceObject =>
    typeof value === 'object' && value !== null && '$ref' in value;


// Components 
export type ComponentsObject = Extensions & {
    schemas?: Record<string, Ref<SchemaObject>>;
    responses?: Record<string, Ref<ResponseObject>>;
    parameters?: Record<string, Ref<ParameterObject>>;
    examples?: Record<string, Ref<ExampleObject>>;
    requestBodies?: Record<string, Ref<RequestBodyObject>>;
    headers?: Record<string, Ref<HeaderObject>>;
    securitySchemes?: Record<string, Ref<SecuritySchemeObject>>;
    links?: Record<string, Ref<LinkObject>>;
    callbacks?: Record<string, Ref<CallbackObject>>;
};

// Callbacks
export type CallbackObject = Extensions & {
    [expression: string]: PathItemObject | unknown;
};

export type ExampleObject = Extensions & {
    summary?: string;
    description?: string;
    value?: unknown;
    externalValue?: string;
};

export type LinkObject = Extensions & {
    operationRef?: string;
    operationId?: string;
    parameters?: Record<string, unknown>;
    requestBody?: unknown;
    description?: string;
    server?: ServerObject;
};

// Based on the OpenAPI v3.0.3 specification:
// https://spec.openapis.org/oas/v3.0.3.html#openapi-object
export type OpenAPIObject = Extensions & {
    openapi: string;
    info: InfoObject;
    servers?: ServerObject[];
    paths: PathsObject;
    components?: ComponentsObject;
    security?: SecurityRequirementObject[];
    tags?: TagObject[];
    externalDocs?: ExternalDocumentationObject;
};

export type InfoObject = Extensions & {
    title: string;
    description?: string;
    termsOfService?: string;
    contact?: ContactObject;
    license?: LicenseObject;
    version: string;
};

export type ContactObject = Extensions & {
    name?: string;
    url?: string;
    email?: string;
};

export type LicenseObject = Extensions & {
    name: string;
    url?: string;
};

export type ServerObject = Extensions & {
    url: string;
    description?: string;
    variables?: Record<string, ServerVariableObject>;
};

export type ServerVariableObject = Extensions & {
    enum?: string[];
    default: string;
    description?: string;
};

export type TagObject = Extensions & {
    name: string;
    description?: string;
    externalDocs?: ExternalDocumentationObject;
};
