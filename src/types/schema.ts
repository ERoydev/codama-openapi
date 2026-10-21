import { Extensions, Ref } from "./document";
import { ExternalDocumentationObject } from "./paths";

// Schema 
export type SchemaType = 'array' | 'boolean' | 'integer' | 'number' | 'object' | 'string';

export type SchemaObject = Extensions & {
    additionalProperties?: Ref<SchemaObject> | boolean;
    // Composition
    allOf?: Ref<SchemaObject>[];
    anyOf?: Ref<SchemaObject>[];
    default?: unknown;
    deprecated?: boolean;
    description?: string;
    discriminator?: DiscriminatorObject;
    enum?: unknown[];
    example?: unknown;
    exclusiveMaximum?: boolean;
    exclusiveMinimum?: boolean;
    externalDocs?: ExternalDocumentationObject;
    format?: string;
    // Arrays
    items?: Ref<SchemaObject>;

    maxItems?: number;
    oneOf?: Ref<SchemaObject>[];
    maxProperties?: number;
    maximum?: number;

    minItems?: number;
    not?: Ref<SchemaObject>;
    minProperties?: number;
    minimum?: number;
    writeOnly?: boolean;

    // Strings
    maxLength?: number;
    nullable?: boolean;
    pattern?: string;

    minLength?: number;
    // Objects
    properties?: Record<string, Ref<SchemaObject>>;
    // Numbers
    multipleOf?: number;
    required?: string[];

    title?: string;
    // Core
    type?: SchemaType;
    uniqueItems?: boolean;
    xml?: XmlObject;
    readOnly?: boolean;
};

export type DiscriminatorObject = {
    mapping?: Record<string, string>;
    propertyName: string;
};

export type XmlObject = Extensions & {
    attribute?: boolean;
    name?: string;
    namespace?: string;
    prefix?: string;
    wrapped?: boolean;
};
