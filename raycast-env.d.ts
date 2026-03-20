/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** cmux CLI Path - Path to the cmux CLI binary */
  "cmuxPath": string
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `list-workspaces` command */
  export type ListWorkspaces = ExtensionPreferences & {}
  /** Preferences accessible in the `open-in-cmux` command */
  export type OpenInCmux = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `list-workspaces` command */
  export type ListWorkspaces = {}
  /** Arguments passed to the `open-in-cmux` command */
  export type OpenInCmux = {}
}

