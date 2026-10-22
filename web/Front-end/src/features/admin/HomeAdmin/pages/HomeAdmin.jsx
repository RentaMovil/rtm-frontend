import '../../../vehicles/pages/Home.css';
import { useTranslation } from "react-i18next";
import NavbarAdmin from "../../../../shared/components/layout/NavBarAdmin.jsx";
import FooterAdmin from "../../../../shared/components/layout/FooterAdmin.jsx";
import CartVehicule from "../../../vehicles/components/CartVehicule";
import FiltrerBrand from "../../../vehicles/components/FiltrerBrand";
import FiltrerPrice from "../../../vehicles/components/FiltrerPrice";
import FiltrerType from "../../../vehicles/components/FilterType";
import FiltreCategory from "../../../vehicles/components/FiltrerCategory.jsx";
import FiltrerModel from "../../../vehicles/components/FiltrerModel.jsx";
import Banner from "../../../../shared/components/layout/Banner.jsx";
import img1 from "../../../../assets/img/img1.png";
import img2 from "../../../../assets/img/img2.jpg";
import img3 from "../../../../assets/img/img3.webp";
import ProcessSteps from "../../../vehicles/components/CardsInfo.jsx";
import FilterCalendar from "../../../vehicles/components/FilterCalendar.jsx";
import { useState, useEffect, useRef } from "react";
import { useCars } from "../../../vehicles/hooks/useCars.js";
import { useLocation, useNavigate } from "react-router-dom";
import { useIsMobile } from "../../../../shared/hooks/useIsMobile.js";
import { FaSearch, FaTimes } from "react-icons/fa";
import { filterAvailableVehicles } from "../../../vehicles/utils/filterAvilableCars.js";
import { filterVehicles } from "../../../vehicles/utils/vehiclesFilters.js";

function HomeAdmin() {
  const { t } = useTranslation();
  const { cars, isLoading: loading, error } = useCars();
  const [hasSearchedCars, setHasSearchedCars] = useState(false);
  const [carsFiltered, setCarsFiltered] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const [brandFilter, setBrandFilter] = useState("");
  const [priceFilter, setPriceFilter] = useState(null);
  const [typeFilter, setTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [modelFilter, setModelFilter] = useState(null);

  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const filterCalendarRef = useRef(null);

  const isMobile = useIsMobile();

  const [searchData, setSearchData] = useState({
    branch: null,
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: ""
  });

  useEffect(() => {
    if (location.state?.triggerSearch && location.state?.rentalSearch && cars.length > 0) {
      const { branch, startDate, endDate, startTime, endTime } = location.state.rentalSearch;

      setSearchData({ branch, startDate, endDate, startTime, endTime });

      filterAvailableVehicles(cars, branch, startDate, endDate).then((disponibles) => {
        setCarsFiltered(disponibles);
        setHasSearchedCars(true);
      });

      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, cars, navigate]);

  const handleSearch = ({ branch, startDate, endDate, startTime, endTime }) => {
    const newSearchData = { branch, startDate, endDate, startTime, endTime };
    setSearchData(newSearchData);

    filterAvailableVehicles(cars, branch, startDate, endDate).then((disponibles) => {
      setCarsFiltered(disponibles);
      setHasSearchedCars(true);
    });
  };

  const handleClearFilters = () => {
    setBrandFilter("");
    setPriceFilter(null);
    setModelFilter(null);
    setTypeFilter("");
    setCategoryFilter("");
  };

  const visibleCars = filterVehicles(carsFiltered, {
    brand: brandFilter,
    type: typeFilter,  
    category: categoryFilter,
    model: modelFilter,
    price: priceFilter
  });

  return (
    <>
      <NavbarAdmin />

      <div className="banner-wrapper">
        <div className="banner-container">
          <Banner imgs={[img1, img2, img3]} />
          <FilterCalendar
            ref={filterCalendarRef}
            onSearch={handleSearch}
            value={searchData}
            onChange={setSearchData}
          />
        </div>
      </div>

      {!hasSearchedCars && <ProcessSteps />}

      {hasSearchedCars && (
        <section className="catalog-layout-container">
          {!isMobile && (
            <aside className="catalog-sidebar">
              <div className="sidebar-sticky-content">
                <h3 className="filters-title">
                  <span className="catalog-sidebar-dot" aria-hidden="true" />
                  {t("filtersHome.availableFleet")}
                </h3>
                <p className="filters-subtitle">{t("filtersHome.subtitle")}</p>

                <FiltrerBrand cars={carsFiltered} onFilter={setBrandFilter} />
                <FiltrerPrice cars={carsFiltered} onFilter={setPriceFilter} />
                <FiltrerModel cars={carsFiltered} onFilter={setModelFilter} />
                <FiltrerType cars={carsFiltered} onFilter={setTypeFilter} />
                <FiltreCategory cars={carsFiltered} onFilter={setCategoryFilter} />
                <button className="btn-clear-filters" onClick={handleClearFilters}>
                  {t("filtersHome.clear")}
                </button>
              </div>
            </aside>
          )}

          <div className="catalog-main-content">
            {isMobile && (
              <div className="filters-mobile-header">
                <button className="filters-toggle-btn" onClick={() => setShowFiltersModal(true)}>
                  <FaBars /> <span>{t("filtersHome.filterFleet")}</span>
                </button>
              </div>
            )}

            <div className="card-vehicule-container">
              {loading && <p className="search-message">{t("filtersHome.searching")}</p>}
              {!loading && error && <p className="notFound">{error}</p>}

              {!loading && !error && visibleCars.length === 0 && (
                <p className="notFound">
                  {t("filtersHome.noVehiclesFiltered")} <FaSearch />
                </p>
              )}

              {!loading && !error && visibleCars.length > 0 &&
                visibleCars.map((car) => (
                  <CartVehicule
                    key={car.id}
                    vehicle={car}
                    rentalSearch={searchData}
                  />
                ))
              }
            </div>
          </div>
        </section>
      )}

      <FooterAdmin />
    </>
  );
}

export default HomeAdmin;
