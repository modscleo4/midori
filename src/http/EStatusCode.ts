/**
 * Copyright 2022 Dhiego Cassiano Fogaça Barbosa
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * HTTP status codes.
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
 */
export enum EStatusCode {
    CONTINUE = 100,
    SWITCHING_PROTOCOLS = 101,
    PROCESSING = 102,
    EARLY_HINTS = 103,

    OK = 200,
    CREATED = 201,
    ACCEPTED = 202,
    NON_AUTHORITATIVE_INFORMATION = 203,
    NO_CONTENT = 204,
    RESET_CONTENT = 205,
    PARTIAL_CONTENT = 206,
    MULTI_STATUS = 207,
    ALREADY_REPORTED = 208,
    IM_USED = 226,

    MULTIPLE_CHOICES = 300,
    MOVED_PERMANENTLY = 301,
    FOUND = 302,
    SEE_OTHER = 303,
    NOT_MODIFIED = 304,
    USE_PROXY = 305,
    SWITCH_PROXY = 306,
    TEMPORARY_REDIRECT = 307,
    PERMANENT_REDIRECT = 308,

    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    PAYMENT_REQUIRED = 402,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    METHOD_NOT_ALLOWED = 405,
    NOT_ACCEPTABLE = 406,
    PROXY_AUTHENTICATION_REQUIRED = 407,
    REQUEST_TIMEOUT = 408,
    CONFLICT = 409,
    GONE = 410,
    LENGTH_REQUIRED = 411,
    PRECONDITION_FAILED = 412,
    PAYLOAD_TOO_LARGE = 413,
    URI_TOO_LONG = 414,
    UNSUPPORTED_MEDIA_TYPE = 415,
    RANGE_NOT_SATISFIABLE = 416,
    EXPECTATION_FAILED = 417,
    I_AM_A_TEAPOT = 418,
    MISDIRECTED_REQUEST = 421,
    UNPROCESSABLE_ENTITY = 422,
    LOCKED = 423,
    FAILED_DEPENDENCY = 424,
    TOO_EARLY = 425,
    UPGRADE_REQUIRED = 426,
    PRECONDITION_REQUIRED = 428,
    TOO_MANY_REQUESTS = 429,
    REQUEST_HEADER_FIELDS_TOO_LARGE = 431,
    UNAVAILABLE_FOR_LEGAL_REASONS = 451,

    INTERNAL_SERVER_ERROR = 500,
    NOT_IMPLEMENTED = 501,
    BAD_GATEWAY = 502,
    SERVICE_UNAVAILABLE = 503,
    GATEWAY_TIMEOUT = 504,
    HTTP_VERSION_NOT_SUPPORTED = 505,
    VARIANT_ALSO_NEGOTIATES = 506,
    INSUFFICIENT_STORAGE = 507,
    LOOP_DETECTED = 508,
    NOT_EXTENDED = 510,
    NETWORK_AUTHENTICATION_REQUIRED = 511
}

export function titleFromStatus(status: number): string | null {
    switch (status) {
        case EStatusCode.CONTINUE:
            return 'Continue';
        case EStatusCode.SWITCHING_PROTOCOLS:
            return 'Switching Protocols';
        case EStatusCode.PROCESSING:
            return 'Processing';
        case EStatusCode.EARLY_HINTS:
            return 'Early Hints';

        case EStatusCode.OK:
            return 'OK';
        case EStatusCode.CREATED:
            return 'Created';
        case EStatusCode.ACCEPTED:
            return 'Accepted';
        case EStatusCode.NON_AUTHORITATIVE_INFORMATION:
            return 'Non-Authoritative Information';
        case EStatusCode.NO_CONTENT:
            return 'No Content';
        case EStatusCode.RESET_CONTENT:
            return 'Reset Content';
        case EStatusCode.PARTIAL_CONTENT:
            return 'Partial Content';
        case EStatusCode.MULTI_STATUS:
            return 'Multi-Status';
        case EStatusCode.ALREADY_REPORTED:
            return 'Already Reported';
        case EStatusCode.IM_USED:
            return 'IM Used';

        case EStatusCode.MULTIPLE_CHOICES:
            return 'Multiple Choices';
        case EStatusCode.MOVED_PERMANENTLY:
            return 'Moved Permanently';
        case EStatusCode.FOUND:
            return 'Found';
        case EStatusCode.SEE_OTHER:
            return 'See Other';
        case EStatusCode.NOT_MODIFIED:
            return 'Not Modified';
        case EStatusCode.USE_PROXY:
            return 'Use Proxy';
        case EStatusCode.SWITCH_PROXY:
            return 'Switch Proxy';
        case EStatusCode.TEMPORARY_REDIRECT:
            return 'Temporary Redirect';
        case EStatusCode.PERMANENT_REDIRECT:
            return 'Permanent Redirect';

        case EStatusCode.BAD_REQUEST:
            return 'Bad Request';
        case EStatusCode.UNAUTHORIZED:
            return 'Unauthorized';
        case EStatusCode.PAYMENT_REQUIRED:
            return 'Payment Required';
        case EStatusCode.FORBIDDEN:
            return 'Forbidden';
        case EStatusCode.NOT_FOUND:
            return 'Not Found';
        case EStatusCode.METHOD_NOT_ALLOWED:
            return 'Method Not Allowed';
        case EStatusCode.NOT_ACCEPTABLE:
            return 'Not Acceptable';
        case EStatusCode.PROXY_AUTHENTICATION_REQUIRED:
            return 'Proxy Authentication Required';
        case EStatusCode.REQUEST_TIMEOUT:
            return 'Request Timeout';
        case EStatusCode.CONFLICT:
            return 'Conflict';
        case EStatusCode.GONE:
            return 'Gone';
        case EStatusCode.LENGTH_REQUIRED:
            return 'Length Required';
        case EStatusCode.PRECONDITION_FAILED:
            return 'Precondition Failed';
        case EStatusCode.PAYLOAD_TOO_LARGE:
            return 'Payload Too Large';
        case EStatusCode.URI_TOO_LONG:
            return 'URI Too Long';
        case EStatusCode.UNSUPPORTED_MEDIA_TYPE:
            return 'Unsupported Media Type';
        case EStatusCode.RANGE_NOT_SATISFIABLE:
            return 'Range Not Satisfiable';
        case EStatusCode.EXPECTATION_FAILED:
            return 'Expectation Failed';
        case EStatusCode.I_AM_A_TEAPOT:
            return 'I\'m a teapot';
        case EStatusCode.MISDIRECTED_REQUEST:
            return 'Misdirected Request';
        case EStatusCode.UNPROCESSABLE_ENTITY:
            return 'Unprocessable Entity';
        case EStatusCode.LOCKED:
            return 'Locked';
        case EStatusCode.FAILED_DEPENDENCY:
            return 'Failed Dependency';
        case EStatusCode.TOO_EARLY:
            return 'Too Early';
        case EStatusCode.UPGRADE_REQUIRED:
            return 'Upgrade Required';
        case EStatusCode.PRECONDITION_REQUIRED:
            return 'Precondition Required';
        case EStatusCode.TOO_MANY_REQUESTS:
            return 'Too Many Requests';
        case EStatusCode.REQUEST_HEADER_FIELDS_TOO_LARGE:
            return 'Request Header Fields Too Large';
        case EStatusCode.UNAVAILABLE_FOR_LEGAL_REASONS:
            return 'Unavailable For Legal Reasons';

        case EStatusCode.INTERNAL_SERVER_ERROR:
            return 'Internal Server Error';
        case EStatusCode.NOT_IMPLEMENTED:
            return 'Not Implemented';
        case EStatusCode.BAD_GATEWAY:
            return 'Bad Gateway';
        case EStatusCode.SERVICE_UNAVAILABLE:
            return 'Service Unavailable';
        case EStatusCode.GATEWAY_TIMEOUT:
            return 'Gateway Timeout';
        case EStatusCode.HTTP_VERSION_NOT_SUPPORTED:
            return 'HTTP Version Not Supported';
        case EStatusCode.VARIANT_ALSO_NEGOTIATES:
            return 'Variant Also Negotiates';
        case EStatusCode.INSUFFICIENT_STORAGE:
            return 'Insufficient Storage';
        case EStatusCode.LOOP_DETECTED:
            return 'Loop Detected';
        case EStatusCode.NOT_EXTENDED:
            return 'Not Extended';
        case EStatusCode.NETWORK_AUTHENTICATION_REQUIRED:
            return 'Network Authentication Required';
    }

    return null;
}
