import { CallbackObject, ExampleObject, Extensions, LinkObject, Ref, ServerObject } from "./document";
import { SchemaObject } from "./schema";
import { SecurityRequirementObject } from "./security";

// Paths 
export type PathsObject = Extensions & {
    [path: `/${string}`]: PathItemObject;
};

export type HttpMethod = 'get' | 'put' | 'post' | 'delete' | 'options' | 'head' | 'patch' | 'trace';

export type PathItemObject = Extensions & {
    $ref?: string;
    summary?: string;
    description?: string;
    get?: OperationObject;
    put?: OperationObject;
    post?: OperationObject;
    delete?: OperationObject;
    options?: OperationObject;
    head?: OperationObject;
    patch?: OperationObject;
    trace?: OperationObject;
    servers?: ServerObject[];
    parameters?: Ref<ParameterObject>[];
};

// Operation
export type OperationObject = Extensions & {
    tags?: string[];
    summary?: string;
    description?: string;
    externalDocs?: ExternalDocumentationObject;
    operationId?: string;
    parameters?: Ref<ParameterObject>[];
    requestBody?: Ref<RequestBodyObject>;
    responses: ResponsesObject;
    callbacks?: Record<string, Ref<CallbackObject>>;
    deprecated?: boolean;
    security?: SecurityRequirementObject[];
    servers?: ServerObject[];
};

export type ExternalDocumentationObject = Extensions & {
    description?: string;
    url: string;
};

// Parameters & Headers 
export type ParameterLocation = 'query' | 'header' | 'path' | 'cookie';

export type ParameterStyle =
    | 'matrix'
    | 'label'
    | 'form'
    | 'simple'
    | 'spaceDelimited'
    | 'pipeDelimited'
    | 'deepObject';

// Fields shared by Parameter and Header objects
type ParameterBase = Extensions & {
    description?: string;
    required?: boolean;
    deprecated?: boolean;
    allowEmptyValue?: boolean;
    style?: ParameterStyle;
    explode?: boolean;
    allowReserved?: boolean;
    schema?: Ref<SchemaObject>;
    example?: unknown;
    examples?: Record<string, Ref<ExampleObject>>;
    content?: Record<string, MediaTypeObject>;
};

export type ParameterObject = ParameterBase & {
    name: string;
    in: ParameterLocation;
};

// A Header is a Parameter without "name" and "in"
export type HeaderObject = ParameterBase;

// Request Body & Media Types 
export type RequestBodyObject = Extensions & {
    description?: string;
    content: Record<string, MediaTypeObject>;
    required?: boolean;
};

export type MediaTypeObject = Extensions & {
    schema?: Ref<SchemaObject>;
    example?: unknown;
    examples?: Record<string, Ref<ExampleObject>>;
    encoding?: Record<string, EncodingObject>;
};

export type EncodingObject = Extensions & {
    contentType?: string;
    headers?: Record<string, Ref<HeaderObject>>;
    style?: ParameterStyle;
    explode?: boolean;
    allowReserved?: boolean;
};

// Responses 
// Keys are "default" or an HTTP status code / range such as "200" or "4XX"
export type ResponsesObject = Extensions & {
    [status: string]: Ref<ResponseObject> | unknown;
};

export type ResponseObject = Extensions & {
    description: string;
    headers?: Record<string, Ref<HeaderObject>>;
    content?: Record<string, MediaTypeObject>;
    links?: Record<string, Ref<LinkObject>>;
};
