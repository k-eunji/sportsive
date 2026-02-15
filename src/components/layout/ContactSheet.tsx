//src/components/layout/ContactSheet.tsx

"use client";

import BottomSheet from "@/components/ui/BottomSheet";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ContactSheet({ open, onClose }: Props) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Contact Us">
      <div className="space-y-6 pt-4">

        <p className="text-sm text-gray-600 dark:text-gray-400">
          For partnerships, venue updates, or general enquiries,
          please contact us below.
        </p>

        <a
          href="mailto:support@venuescope.io?subject=VenueScope Enquiry"
          className="block w-full text-center bg-black text-white py-3 rounded-xl font-medium"
        >
          Email support@venuescope.io
        </a>

      </div>
    </BottomSheet>
  );
}
