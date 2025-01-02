"use client";

import { useEffect, useRef } from "react";
import { usePlacesWidget } from "react-google-autocomplete";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { useFormik } from "formik";
import * as Yup from "yup";

import DefaultLayout from "@/layouts/default";

declare global {
  interface Global {
    GOOGLE_MAPS_API_KEY?: string;
  }
}

const validationSchema = Yup.object().shape({
  addressLine1: Yup.string().required("Address Line 1 is required"),
  city: Yup.string().required("City is required"),
  postcode: Yup.string().required("Postcode is required"),
  country: Yup.string().required("Country is required"),
});

const API_KEY =
  (globalThis as unknown as Global).GOOGLE_MAPS_API_KEY ??
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY!;

export default function AdvancedAddressAutocomplete() {
  const inputRef = useRef<HTMLInputElement>(null);

  const formik = useFormik({
    initialValues: {
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postcode: "",
      country: "",
    },
    validationSchema,
    onSubmit: (values) => {
      console.log(values);
      // Handle form submission, e.g., send data to an API
    },
  });

  const { ref: placesRef }: any = usePlacesWidget({
    apiKey: API_KEY,
    onPlaceSelected: (place) => {
      const addressComponents = place.address_components as any;

      console.log(placesRef, "placesRef");
      const newAddress = {
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        postcode: "",
        country: "",
      };

      console.log("addressComponents", addressComponents);

      addressComponents.forEach((component: any) => {
        const types = component.types;

        console.log(component, "component");
        if (types.includes("street_number")) {
          newAddress.addressLine1 =
            component.long_name + " " + newAddress.addressLine1;
        } else if (types.includes("route")) {
          newAddress.addressLine1 += component.long_name;
        } else if (types.includes("locality")) {
          newAddress.city = component.long_name;
        } else if (types.includes("administrative_area_level_1")) {
          newAddress.state = component.short_name;
        } else if (types.includes("postal_code")) {
          newAddress.postcode = component.long_name;
        } else if (types.includes("country")) {
          newAddress.country = component.long_name;
        }
      });

      // Use `formatted_address` as a fallback for addressLine1
      if (!newAddress.addressLine1 && place.formatted_address) {
        newAddress.addressLine1 = place.formatted_address;
      }

      newAddress.addressLine1 = newAddress.addressLine1.trim();
      formik.setValues(newAddress);

      // Clear the search input
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    options: {
      types: ["geocode"], // Include geocode to support postal codes and detailed addresses
      componentRestrictions: { country: "ca" },
      fields: ["address_components", "formatted_address", "geometry"],
      strictBounds: false,
    },
  });

  useEffect(() => {
    if (inputRef.current) {
      placesRef.current = inputRef.current;
    }
  }, [placesRef]);

  return (
    <DefaultLayout>
      <div className="w-full max-w-2xl mx-auto">
        <form className="space-y-4" onSubmit={formik.handleSubmit}>
          <div>
            <Input
              ref={inputRef}
              className="w-full"
              id="addressSearch"
              placeholder="Start typing your address, postcode, or city..."
            />
          </div>
          <div>
            <Input
              id="addressLine1"
              {...formik.getFieldProps("addressLine1")}
              placeholder="Address Line 1"
            />
            {formik.touched.addressLine1 && formik.errors.addressLine1 && (
              <p>{formik.errors?.addressLine1}</p>
            )}
          </div>
          <div>
            <Input
              id="addressLine2"
              {...formik.getFieldProps("addressLine2")}
              placeholder="Address Line 2"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input
                id="city"
                {...formik.getFieldProps("city")}
                placeholder="City"
              />
              {formik.touched.city && formik.errors.city && (
                <p>{formik.errors.city}</p>
              )}
            </div>
            <div>
              <Input
                id="state"
                {...formik.getFieldProps("state")}
                placeholder="State/Province"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input
                id="postcode"
                {...formik.getFieldProps("postcode")}
                placeholder="Postcode"
              />
              {formik.touched.postcode && formik.errors.postcode && (
                <p>{formik.errors.postcode}</p>
              )}
            </div>
            <div>
              <Input
                id="country"
                {...formik.getFieldProps("country")}
                placeholder="Country"
              />
              {formik.touched.country && formik.errors.country && (
                <p>{formik.errors.country}</p>
              )}
            </div>
          </div>
          <Button className="w-full" type="submit">
            Submit
          </Button>
        </form>
      </div>
    </DefaultLayout>
  );
}
