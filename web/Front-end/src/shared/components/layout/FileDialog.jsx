import React, { useRef, useState, useEffect, useCallback } from 'react'
import './FileDialog.css'
import { useDropzone } from 'react-dropzone'
import { BiImageAdd } from "react-icons/bi";
import { AiOutlineDashboard, AiOutlineInfoCircle } from "react-icons/ai";
import { useTranslation } from 'react-i18next';

/* 
voy a utilizar un servicio de la nube el cual va a ser claudinary, 
la idea es que con el tiempo se va a conectar el formulario 
con el backend y se va a enviar la imagen a claudinary, 
pero por ahora solo se va a mostrar la imagen en la consola
para verificar que se esta capturando correctamente el archivo seleccionado por el usuario.

lo que se hace acontinuacion es considerado como una mala practica :v
*/

function FileDialog({ onFileChange, file, variant = 'default', invalid = false }) {
    const { t } = useTranslation();
    /*  const [file, setFile] = useState() */ // estado para almacenar el archivo seleccionado
    const [preview, setPreview] = useState(null) // estado para almacenar la url de la imagen seleccionada

    useEffect(() => {
        if (!file) {
            setPreview(null)
            return
        }

        if (typeof file === 'string') {
            setPreview(file)
            return
        }

        const objectUrl = URL.createObjectURL(file)
        setPreview(objectUrl)

        return () => {
            URL.revokeObjectURL(objectUrl)
        }
    }, [file])

    const onDrop = useCallback(acceptedFiles => {
        const selectedFile = acceptedFiles[0]
        if (selectedFile) {
            onFileChange(selectedFile);
        }
    }, [onFileChange])

    const isCard = variant === 'card';
    const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        // variante "card": con foto cargada se puede soltar otra encima, pero el clic en la foto no abre el selector
        noClick: isCard && Boolean(preview),
        noKeyboard: isCard && Boolean(preview),
    });

    const handleChangeImage = () => {
        setPreview(null); // se limpia la url de la imagen seleccionada por el usuario
        if (typeof onFileChange === 'function') onFileChange(null); // notifica que se quito el archivo
    }



    if (isCard) {
        const zoneClass = [
            'fd-zone',
            preview && 'fd-zone--filled',
            isDragActive && 'fd-zone--active',
            invalid && !preview && 'fd-zone--invalid',
        ].filter(Boolean).join(' ');

        return (
            <div {...getRootProps({ className: zoneClass })}>
                <input {...getInputProps()} />
                {preview ? (
                    <div className="fd-preview">
                        <div className="fd-preview-img">
                            <img src={preview} alt="preview" />
                        </div>
                        <div className="fd-preview-bar">
                            <p className="fd-hint"><AiOutlineInfoCircle /> {t('vehicleForm.imgp')}</p>
                            <button type="button" className="fd-change" onClick={open}>
                                {t('vehicleForm.changeImage')}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="fd-empty">
                        <span className="fd-icon"><BiImageAdd /></span>
                        <p className="fd-text">{isDragActive ? t('vehicleForm.imgp2') : t('vehicleForm.imgp3')}</p>
                        <p className="fd-hint"><AiOutlineInfoCircle /> {t('vehicleForm.imgp')}</p>
                    </div>
                )}
            </div>
        );
    }

    return (
        <>
            <div {...getRootProps()} className="file-dialog">
                <div>
                    {preview ? ( /* si hay una imagen , muestra la imagen y el boton para cambiarla  */
                        <div className="preview-container">
                            <img src={preview} alt="preview" />
                            <div className='preview-buttons'>
                                <button type='button' onClick={handleChangeImage}>{t('vehicleForm.changeImage')}</button>
                            </div>
                            <p><AiOutlineDashboard /> {t('vehicleForm.imgp')}</p>
                        </div>
                    ) : ( // si no hay una imagen, muestra el area de dropzone para seleccionar una imagen
                        <div className='preview-container'>
                            <input {...getInputProps()} />
                            {isDragActive ? (
                                <p>{t('vehicleForm.imgp2')}</p>
                            ) : (
                                <p>{t('vehicleForm.imgp3')}<BiImageAdd /></p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}




/*         <div className="file-dialog">
            <div className='conainer-data'>
                    <p>Arrastra la imagen aquí o</p>
                  
            </div>
        </div> */


export default FileDialog