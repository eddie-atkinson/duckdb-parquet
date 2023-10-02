import { Component, ComponentType, Key } from "preact";
import { JSX } from "preact/jsx-runtime";

interface ReactElement<
  P = any,
  T extends string | JSXElementConstructor<any> =
    | string
    | JSXElementConstructor<any>
> {
  type: T;
  props: P;
  key: Key | null;
}

type JSXElementConstructor<P> =
  | ((props: P) => ReactElement | null)
  | (new (props: P) => Component<P, any>);

type ComponentProps<
  T extends keyof JSX.IntrinsicElements | JSXElementConstructor<any>
> = T extends JSXElementConstructor<infer P>
  ? P
  : T extends keyof JSX.IntrinsicElements
  ? JSX.IntrinsicElements[T]
  : {};

type PropsWithoutRef<P> =
  // Just Pick would be sufficient for this, but I'm trying to avoid unnecessary mapping over union types
  // https://github.com/Microsoft/TypeScript/issues/28339
  "ref" extends keyof P ? Pick<P, Exclude<keyof P, "ref">> : P;

type ElementType<P = any> =
  | {
      [K in keyof JSX.IntrinsicElements]: P extends JSX.IntrinsicElements[K]
        ? K
        : never;
    }[keyof JSX.IntrinsicElements]
  | ComponentType<P>;

export type ComponentPropsWithoutRef<T extends ElementType> = PropsWithoutRef<
  ComponentProps<T>
>;
