import React from "react";

const MobileAppPage = () => {
  return (
    <div>
      <>
        <section className="w-full min-h-screen flex flex-col md:flex-row items-center justify-between  px-6 md:px-16 py-12">
          {/* Left Content */}

          <div className="md:w-1/2 space-y-6">
            <h2 className=" font-semibold "  >
              Get the Madadghaar App <br /> Get controls of all your needs anywhere, anytime
            </h2>

            

            <button  style={{ backgroundColor: "rgba(183, 36, 42, 0.6)" }} className="mt-6 p-2 text-white  font-medium hover:bg-blue-700 transition rounded-full">
             Already installed or Not supported
            </button>
          </div>

          {/* Right Image */}
          <div className="md:w-1/2 mt-10 md:mt-0 flex justify-center">
            <img
              src="/Media/mobileAppMockup.png"
              alt="Madadgaar Services"
              className="rounded-2xl  w-full max-w-md "
            />
          </div>
        </section>
      </>
    </div>
  );
};

export default MobileAppPage;
