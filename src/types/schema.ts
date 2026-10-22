import { Extensions, Ref } from './document';
import { ExternalDocumentationObject } from './paths';

// Schema
export type SchemaType = 'array' | 'boolean' | 'integer' | 'number' | 'object' | 'string';

// Schema name -> definition, e.g. components.schemas before $ref-wrapping
export type SchemaMap = Record<string, SchemaObject>;

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
    // Strings
    maxLength?: number;
    maxProperties?: number;
    maximum?: number;

    minItems?: number;
    minLength?: number;
    minProperties?: number;
    minimum?: number;
    // Numbers
    multipleOf?: number;

    not?: Ref<SchemaObject>;
    nullable?: boolean;
    oneOf?: Ref<SchemaObject>[];

    pattern?: string;
    // Objects
    properties?: Record<string, Ref<SchemaObject>>;
    readOnly?: boolean;
    required?: string[];

    title?: string;
    // Core
    type?: SchemaType;
    uniqueItems?: boolean;
    writeOnly?: boolean;
    xml?: XmlObject;
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
