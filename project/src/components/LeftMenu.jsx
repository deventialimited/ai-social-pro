import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  LogOut,
  Plus,
  ChevronDown,
  Share2,
  User,
  X,
} from "lucide-react";
import { Listbox } from "@headlessui/react";
import { Link } from "./Link";
import { AddWebsiteModal } from "./AddWebsiteModal";
import { useDomains } from "../libs/domainService";
import { updateSelectedDomain } from "../libs/authService";
import PricingModal from "../PopUps/PricingModal";
import { useAuthStore } from "../store/useAuthStore";

export const LeftMenu = ({
  userId,
  selectedWebsite,
  onWebsiteChange,
  currentTab,
  onTabChange,
  onAddBusiness,
  isOpen,
  onClose,
  onNewPost,
  navigate,
}) => {
  const { data: domains, isLoading } = useDomains(userId);
  const [showAddWebsite, setShowAddWebsite] = useState(false);
  const selectedWebsiteData = domains?.find((w) => w?._id === selectedWebsite);
  const [openModal, setopenModal] = useState(false);
  const { setUser, clearUser } = useAuthStore();
  console.log("Selected website data: ", selectedWebsiteData);

  const openModalhandler = () => {
    setopenModal(true);
  };
  const closeModalhandler = () => {
    setopenModal(false);
  };
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [currentTab]);
  const handleWebsiteChange = async (val) => {
    console.log("[LeftMenu] Changing selected domain:", val);
    onWebsiteChange(val);
    try {
      const result = await updateSelectedDomain(userId, val);
      console.log(
        "[LeftMenu] Domain updated successfully on the backend:",
        result
      );
      setUser(result?.user);
    } catch (e) {
      console.error("[LeftMenu] Error updating selected domain on backend:", e);
    }
  };

  const handleGeneratePosts = (url) => {
    onAddBusiness(url);
    setShowAddWebsite(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    clearUser();
    navigate("/");
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 lg:hidden transition-opacity duration-300 z-30 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
      <div
        className={`w-64 bg-white dark:bg-gray-800 h-screen fixed left-0 top-0 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <button
          onClick={onClose}
          className="lg:hidden absolute right-4 top-4 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div
          onClick={() => navigate("/")}
          className="h-20 cursor-pointer px-6 flex items-center border-b border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-3">
            <img
              src="/oneyear-logo.svg"
              alt="OneYear Social"
              className="w-8 h-8"
            />
            <span className="font-semibold text-gray-900 dark:text-white">
              OneYear Social
            </span>
          </div>
        </div>

        <div className="px-6 py-6">
          {selectedWebsite && (
            <Listbox value={selectedWebsite} onChange={handleWebsiteChange}>
              <div className="relative">
                <Listbox.Button className="relative w-full pl-12 pr-12 py-3 text-left rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  <span className="flex items-center">
                    <img
                      src={selectedWebsiteData?.siteLogo}
                      alt="Selected website logo"
                      className="w-6  h-6 rounded-full absolute left-4"
                    />
                    <span className="block truncate">
                      {selectedWebsiteData?.clientName}
                    </span>
                  </span>
                  <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                    <ChevronDown
                      className="w-4 h-4 text-gray-400"
                      aria-hidden="true"
                    />
                  </span>
                </Listbox.Button>
                <Listbox.Options className="absolute z-10 mt-2 w-full bg-white dark:bg-gray-700 rounded-md shadow-lg border border-gray-200 dark:border-gray-600 py-1 overflow-auto max-h-60">
                  {!isLoading &&
                    domains?.map((website) => (
                      <Listbox.Option
                        key={website._id}
                        value={website._id}
                        className={({ active, selected }) =>
                          `relative cursor-pointer select-none py-3 pl-12 pr-4 ${
                            active
                              ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                              : selected
                              ? "bg-gray-50 dark:bg-gray-600/50 text-gray-900 dark:text-white"
                              : "text-gray-900 dark:text-white"
                          }`
                        }
                      >
                        {({ selected }) => (
                          <>
                            <img
                              src={website.siteLogo}
                              alt={`${website.clientName} logo`}
                              className="w-6 h-6 rounded-full absolute left-4"
                            />
                            <span
                              className={`block truncate ${
                                selected ? "font-medium" : "font-normal"
                              }`}
                            >
                              {website.clientName}
                            </span>
                          </>
                        )}
                      </Listbox.Option>
                    ))}
                </Listbox.Options>
              </div>
            </Listbox>
          )}

          <button
            onClick={() => setShowAddWebsite(true)}
            className="w-full mt-3 flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            <Plus className="w-4 h-4 mr-3" />
            <span>Add New Business</span>
          </button>
        </div>

        <nav className="px-6 mt-2">
          <Link
            href="#"
            active={currentTab === "dashboard"}
            onClick={() => onTabChange("dashboard")}
            icon={<LayoutDashboard className="w-5 h-5" />}
          >
            Dashboard
          </Link>
          <Link
            href="#"
            active={currentTab === "posts"}
            onClick={() => onTabChange("posts")}
            icon={<FileText className="w-5 h-5" />}
          >
            Posts
          </Link>
          <Link
            href="#"
            active={currentTab === "business"}
            onClick={() => onTabChange("business")}
            icon={<Briefcase className="w-5 h-5" />}
          >
            Business
          </Link>
          <Link
            href="#"
            active={currentTab === "socials"}
            onClick={() => onTabChange("socials")}
            icon={<Share2 className="w-5 h-5" />}
          >
            Socials
          </Link>
          <Link
            href="#"
            active={currentTab === "character"}
            onClick={() => onTabChange("character")}
            icon={<User className="w-5 h-5" />}
          >
            Character
          </Link>
          <Link href="#" onClick={openModalhandler}>
            Claim 50% Off Anually
          </Link>
          <Link
            href="#"
            active={currentTab === "subscription"}
            onClick={() => onTabChange("subscription")}
          >
            Subscription Management
          </Link>
        </nav>

        <div className="absolute bottom-4 w-full px-6">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white w-full px-4 py-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {showAddWebsite && (
        <AddWebsiteModal
          onClose={() => setShowAddWebsite(false)}
          onGenerate={handleGeneratePosts}
        />
      )}

      <PricingModal
        isOpen={openModal}
        onClose={closeModalhandler}
        onNewPost={onNewPost}
      />
    </>
  );
};
