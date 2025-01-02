import { useLoaderData as useRemixLoaderData } from "@remix-run/react";

type Nullable<Type> = Type | undefined | null;

type Deserialized<Data> = Data extends Nullable<{ [key: string]: unknown }>
  ? { [Key in keyof Data]: Deserialized<Data[Key]> }
  : Data extends (infer U)[]
  ? Deserialized<U>[]
  : Data extends Date
  ? string
  : Data;

export const useLoaderData = <Data>(): Deserialized<Data> =>
  useRemixLoaderData<Deserialized<Data>>() as Deserialized<Data>;
