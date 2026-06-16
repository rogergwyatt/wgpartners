
import AboutUs from "@/controls/aboutus";
import ContactForm from "@/controls/contactform";
import HeroArea from "@/controls/heroarea";
import SectionSplitArea from "@/controls/sectionSplitArea";
import { sans, serif } from '../controls/fonts'
import { Toaster } from 'sonner';
import TopSection from "@/controls/topSection";
import FooterSection from "@/controls/footerSection";
import Products from "@/controls/products";
import TreeIcon from "@/controls/treeIcon";
import MountainIcon from "@/controls/mountainIco";
import GearIcon from "@/controls/gearIcon";
import WhyRogerAndSally from "@/controls/whyRogerAndSally";
import Gallery from "@/controls/gallery";


export default function Home() {
  return (
    <main className={"bg-parchment flex flex-col items-center justify-between p-0 " + sans.className}>
      <Toaster richColors/>
      <TopSection/>
      <HeroArea />
      <div id="contentBody" className="w-full items-center justify-between content-center">
        <div className="items-center justify-center content-center mx-auto">
          <h1 className={"w-full text-2xl lg:text-5xl text-center text-walnut mt-3 mb-1 " + serif.className}>
            Handcrafted Heritage Lock Cutting &amp; Charcuterie Boards
          </h1>
          <p className={"w-full text-lg lg:text-3xl text-center text-slate italic mb-3 lg:mb-10 " + serif.className}>
            Forty Years of Code. A Lifetime of Craft.
          </p>
        </div>
        <div className="lg:w-[60%] items-center justify-center content-center mx-auto">
          <div className="w-full">
            <div className="w-full center p-2 text-center mr-5">
              <div className="min-h-52 text-small lg:text-3xl">
                <span className={"font-bold hidden lg:block " + serif.className}>
                  We hand-pick every board and lock every edge. Discover heirloom-quality cutting boards and home goods, engineered in Virginia and built for a lifetime of service.
                </span>
                <span className="font-bold block lg:hidden text-md">
                  We hand-pick every board and lock every edge. Discover heirloom-quality cutting boards and home goods, engineered in Virginia and built for a lifetime of service.
                </span>
                <br/>
                <div className="items-center text-left text-small lg:text-xl block lg:grid lg:grid-flow-col lg:grid-rows-1 lg:grid-cols-3 gap-4">
                  <div className="mt-2 lg:mt-5 lg:w-[300px]">
                    <div className="text-center align-center bg-cherry text-walnut p-4 rounded-xl border-4 border-black lg:h-[500px]">
                      <TreeIcon/><br/>
                      <span className="font-bold">Hand-Picked Timber</span><br/>
                      We don't buy pallets. Roger personally selects every piece of Walnut, Cherry, and Maple for its unique character and structural integrity.
                    </div>
                  </div>
                  <div className="mt-2 lg:mt-5 lg:w-[300px]">
                    <div className="text-center align-center bg-maple text-walnut p-4 rounded-xl border-4 border-black lg:h-[500px]">
                      <GearIcon/><br/>
                      <span className="font-bold">The Heritage Lock</span><br/>
                      Our signature blind and through dowel joinery mechanically anchors the edges of every board, preventing the splits and separations common in standard glue-only boards.
                    </div>
                  </div>
                  <div className="mt-2 lg:mt-5 lg:w-[300px]">
                    <div className="text-center align-center bg-walnut text-maple p-4 rounded-xl border-4 border-black lg:h-[500px]">
                      <MountainIcon/><br/>
                      <span className="font-bold">Built for the Future</span><br/>
                      Every purchase supports our journey from the digital world to our forest sanctuary in Tennessee. Built by hand, from our home to yours.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <a id="whyChoose"/>
          <WhyRogerAndSally/>
          <a id="gallery"/>
          <Gallery/>
          <a id="products"/>
          <Products/>
          <a id="aboutus"/>
          <AboutUs/>
        </div>
      <SectionSplitArea/>
      <a id="contactform"/>
      <div className="lg:w-[60%] items-center justify-center content-center mx-auto">
        <div id="contactUsSection" className="w-full">
          <div className={"font-bold text-xl lg:text-5xl text-center " + serif.className}>
            Contact Us
          </div>
          <ContactForm/>
        </div>
        <FooterSection/>
      </div>
    </div>

    <div className="min-w-full min-h-10 bg-[#2d241e;] flex px-10 py-2 justify-between">&nbsp;</div>
    </main>
  );
}
