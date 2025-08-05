export {};

declare global {
  interface Window {
    daum: {
      Postcode: new (options: {
        oncomplete: (data: {
          address: string;
          addressType?: string;
          bname?: string;
          buildingName?: string;
          zonecode?: string;
          [key: string]: unknown;
        }) => void;
      }) => {
        open: () => void;
      };
    };
  }
}
