import {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle
} from "react";

import "./FilterCalendar.css";
import { useTranslation } from "react-i18next";
import { useBranches } from "../../admin/branches/hooks/useBranch.js";
const FilterCalendar = forwardRef(
  (
    {
      onSearch,
      variant = "overlay",
      setPickupDate,
      setReturnDate,
      value,
    },
    ref
  ) => {

    const { t } = useTranslation();

    const today = new Date().toISOString().split("T")[0];

    const getCurrentTime = () =>
      new Date().toTimeString().slice(0, 5);

    const getTomorrow = () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      return tomorrow.toISOString().split("T")[0];
    };

    const [showFilters, setShowFilters] = useState(false);

    const [query, setQuery] = useState("");
    const [sugerencias, setSugerencias] = useState([]);
    const [seleccionado, setSeleccionado] = useState(null);
    const {branches} = useBranches();
    const [hora, setHora] = useState(getCurrentTime());
    const [returnhora, setReturnHora] = useState(getCurrentTime());

    const [date, setDate] = useState(today);
    const [dateReturn, setDateReturn] = useState(getTomorrow());

    const [success, setSuccess] = useState("");

    const [errorSucursal, setErrorSucursal] = useState("");
    const [errorFecha, setErrorFecha] = useState("");
    const [errorHora, setErrorHora] = useState("");
    const [errorReturnHora, setErrorReturnHora] = useState("");

    const wrapperRef = useRef(null);

    /*
     * ============================================================
     * SINCRONIZACIÓN CON EL PADRE
     * ============================================================
     *
     * `value` contiene la última búsqueda realizada.
     *
     * Esto permite que el calendario del modal pueda mostrar
     * exactamente la misma información que el calendario principal.
     */
    useEffect(() => {

      if (!value) return;

      setSeleccionado(value.branch ?? null);
      setQuery(value.branch?.name ?? "");

      setDate(value.startDate || today);
      setDateReturn(value.endDate || getTomorrow());

      setHora(value.startTime || getCurrentTime());
      setReturnHora(value.endTime || getCurrentTime());

    }, [value]);


    /*
     * ============================================================
     * VALIDACIÓN DE FECHAS
     * ============================================================
     */
    useEffect(() => {

      if (date && dateReturn) {

        setErrorFecha(
          dateReturn < date
            ? t("filterCalendar.errorDate")
            : ""
        );

      }

    }, [date, dateReturn, t]);


    /*
     * ============================================================
     * CERRAR SUGERENCIAS
     * ============================================================
     */
    useEffect(() => {

      const handleClickOutside = (e) => {

        if (
          wrapperRef.current &&
          !wrapperRef.current.contains(e.target)
        ) {
          setSugerencias([]);
        }

      };

      document.addEventListener(
        "mousedown",
        handleClickOutside
      );

      return () =>
        document.removeEventListener(
          "mousedown",
          handleClickOutside
        );

    }, []);


    /*
     * ============================================================
     * FECHA DE RECOGIDA
     * ============================================================
     */
    useEffect(() => {

      if (setPickupDate) {
        setPickupDate(date);
      }

    }, [date, setPickupDate]);


    /*
     * ============================================================
     * FECHA DE DEVOLUCIÓN
     * ============================================================
     */
    useEffect(() => {

      if (setReturnDate) {
        setReturnDate(dateReturn);
      }

    }, [dateReturn, setReturnDate]);


    /*
     * ============================================================
     * BUSCAR SUCURSAL
     * ============================================================
     */
  /*
   * ============================================================
   * BUSCAR SUCURSAL
   * ============================================================
   */
  const handleChange = async (e) => { // 1. Agregamos async aquí

    const inputValue = e.target.value;

    setQuery(inputValue);
    setSeleccionado(null);
    setErrorSucursal("");

    if (!inputValue.trim()) {
      setSugerencias([]);
      return;
    }

    try {
      const listaSucursales = branches || [];

      // Filtramos localmente comparando el nombre, ciudad o dirección de la sucursal
      const filtradas = listaSucursales.filter((branch) =>
        branch.name?.toLowerCase().includes(inputValue.toLowerCase()) ||
        branch.city?.toLowerCase().includes(inputValue.toLowerCase()) ||
        branch.address?.toLowerCase().includes(inputValue.toLowerCase())
      );
      setSugerencias(filtradas)
    } catch (error) {
      console.error("Error al obtener las sucursales:", error);
      // Aquí puedes gestionar un estado de error visual si lo deseas
      setSugerencias([]);
    }
  };



    /*
     * ============================================================
     * SELECCIONAR SUCURSAL
     * ============================================================
     */
    const handleSelect = (sucursal) => {

      setQuery(sucursal.name);
      setSeleccionado(sucursal);

      setSugerencias([]);
      setErrorSucursal("");

    };


    /*
     * ============================================================
     * VALIDAR HORA
     * ============================================================
     */
    const validarHora = (h) => {

      if (!h) return false;

      const [hh] = h
        .split(":")
        .map(Number);

      return hh >= 8 && hh <= 18;
    };


    /*
     * ============================================================
     * BUSCAR VEHÍCULOS
     * ============================================================
     */
    const handleSubmit = () => {

      setErrorSucursal("");
      setErrorHora("");
      setErrorReturnHora("");
      setSuccess("");


      if (!seleccionado) {

        setErrorSucursal(
          t("filterCalendar.errorBranch")
        );

        return false;
      }


      if (!validarHora(hora)) {

        setErrorHora(
          t("filterCalendar.errorHour")
        );

        return false;
      }


      if (!validarHora(returnhora)) {

        setErrorReturnHora(
          t("filterCalendar.errorHour")
        );

        return false;
      }


      /*
       * IMPORTANTE:
       *
       * Aquí es donde el calendario comunica
       * la búsqueda al componente Home.
       */
      onSearch({
        branch: seleccionado,
        startDate: date,
        endDate: dateReturn,
        startTime: hora,
        endTime: returnhora
      });


      setSuccess(
        t("filterCalendar.success")
      );

      return true;
    };


    /*
     * ============================================================
     * MÉTODOS EXPUESTOS A HOME
     * ============================================================
     */
    useImperativeHandle(ref, () => ({

      submit: () => {
        return handleSubmit();
      },


      clear: () => {

        const newToday = new Date()
          .toISOString()
          .split("T")[0];

        const newTomorrow = getTomorrow();


        setQuery("");
        setSeleccionado(null);

        setHora(getCurrentTime());
        setReturnHora(getCurrentTime());

        setDate(newToday);
        setDateReturn(newTomorrow);

        setSugerencias([]);

        setSuccess("");

        setErrorSucursal("");
        setErrorFecha("");
        setErrorHora("");
        setErrorReturnHora("");

      }

    }));


    return (
      <div className="filter-wrapper">

        <form
          className={`filter ${variant} ${showFilters ? "open" : ""
            }`}
          onSubmit={(e) => {

            e.preventDefault();

            handleSubmit();

          }}
        >


          <div
            className="field"
            ref={wrapperRef}
          >

            <label className="label-filter1">
              {t("filterCalendar.deliveryLocation")}
            </label>

            <input
              className={`input-container ${errorSucursal
                  ? "inputInvalid"
                  : ""
                }`}
              value={query}
              onChange={handleChange}
              placeholder={t("filterCalendar.branchPlaceholder")}
              autoComplete="off"
              required
            />

            {errorSucursal && (
              <div className="message-error">
                {errorSucursal}
              </div>
            )}

            {sugerencias.length > 0 && (

              <ul className="sucursal-dropdown">

                {sugerencias.map((s) => (

                  <li
                    key={s.id}
                    onMouseDown={(e) =>
                      e.preventDefault()
                    }
                    onClick={() =>
                      handleSelect(s)
                    }
                  >
                    {s.name}
                  </li>

                ))}

              </ul>

            )}

          </div>


          <div className="field">

            <label className="label-filter1">
              {t("filterCalendar.deliveryDate")}
            </label>

            <input
              type="date"
              className={`input-container ${errorFecha
                  ? "inputInvalid"
                  : ""
                }`}
              min={today}
              value={date}
              onChange={(e) =>
                setDate(e.target.value)
              }
            />

            {errorFecha && (
              <div className="message-error">
                {errorFecha}
              </div>
            )}

          </div>


          <div className="field">

            <label className="label-filter1">
              {t("filterCalendar.deliveryHour")}
            </label>

            <input
              type="time"
              className={`input-container ${errorHora
                  ? "inputInvalid"
                  : ""
                }`}
              value={hora}
              onChange={(e) => {

                setHora(e.target.value);
                setErrorHora("");

              }}
            />

            {errorHora && (
              <div className="message-error">
                {errorHora}
              </div>
            )}

          </div>


          <div className="field">

            <label className="label-filter1">
              {t("filterCalendar.returnDate")}
            </label>

            <input
              type="date"
              className="input-container"
              min={date}
              value={dateReturn}
              onChange={(e) =>
                setDateReturn(e.target.value)
              }
            />

          </div>


          <div className="field">

            <label className="label-filter1">
              {t("filterCalendar.returnHour")}
            </label>

            <input
              type="time"
              className={`input-container ${errorReturnHora
                  ? "inputInvalid"
                  : ""
                }`}
              value={returnhora}
              onChange={(e) => {

                setReturnHora(e.target.value);
                setErrorReturnHora("");

              }}
            />

            {errorReturnHora && (
              <div className="message-error">
                {errorReturnHora}
              </div>
            )}

          </div>



          <button
            type="submit"
            className="btn-search"
          >
            {variant == "normal" ? t("filterCalendar.change") : t("filterCalendar.search")}
          </button>


          {success && (
            <p className="success">
              {success}
            </p>
          )}

        </form>

      </div>
    );
  }
);

export default FilterCalendar;