---
title: "Guía Definitiva: Limpieza y Reinstalación de Office (Error de Versión LTSC)"
date: 2026-01-02
category: Software
tags: office, windows, ltsc, licencias, drm
author: CoreDump Admin
abstract: "Guía definitiva para eliminar instalaciones persistentes de Office LTSC cuando los métodos convencionales fallan. Se detalla un proceso de tres etapas: desinstalación forzada con herramientas externas, limpieza manual de directorios críticos y registros, y la depuración final de licencias mediante ospp.vbs tras la reinstalación. Ideal para resolver conflictos de "versión incorrecta" o bloqueos en el instalador."
image: /images/2025/cuatro.png

---

Admitámoslo: intentar desinstalar Office LTSC es como intentar terminar con un ex tóxico que se niega a sacar sus cosas de tu casa. Le dices que se vaya (vía Panel de Control), crees que se ha ido, pero cuando intentas meter una nueva versión de Office, ¡sorpresa!, ahí siguen sus fotos en el registro y sus carpetas escondidas en el AppData gritando: "¡Todavía estoy aquí!".

El LTSC (Long-Term Servicing Channel) es esa versión corporativa que se cree dueña de tu disco duro. A veces, ni el desinstalador oficial de Microsoft sabe cómo deshacerse de él, dejando errores de "instalación en curso" o conflictos de licencias que te hacen querer lanzar la laptop por la ventana.

Si ya probaste de todo y el instalador sigue dándote errores crípticos, no pierdas la fe (ni el pelo). Aquí te traigo el procedimiento de limpieza profunda —mi método personal— para cuando la diplomacia falla y necesitas usar la fuerza bruta para dejar el sistema impecable.



Fase 1: Desinstalación y Limpieza Profunda
Primero debemos eliminar cualquier rastro físico y de registro para que el nuevo instalador no detecte conflictos.

Desinstalación Inicial: Intenta quitar el programa desde el Panel de Control. Si falla, usa herramientas de fuerza bruta como Geek Uninstaller, CCleaner o Glary Utilities.

Borrado Manual de Carpetas: Elimina estas rutas (asegúrate de ver archivos ocultos):

C:\Program Files (x86)\Microsoft Office

C:\Program Files (x86)\Office

C:\Program Files\Microsoft Office 15

C:\Users\%USERNAME%\AppData\Local\Microsoft\Office

C:\Users\Administrador\AppData\Local\Microsoft\Office

C:\Users\%USERNAME%\AppData\Roaming\Microsoft\Office

Limpieza de Registro: Abre regedit y elimina:

HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Policies\Office

HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Office

Fase 2: Reinstalación y Depuración de Licencia
Una vez que el sistema está limpio, procedemos a corregir la licencia a nivel interno.

Instalar Office: Ejecuta el instalador de la versión correcta.

Ejecutar Terminal: Abre el CMD como administrador.

Localizar Script: Entra a la carpeta de la nueva instalación: cd "C:\Program Files\Microsoft Office\Office16"

Limpiar Claves LTSC: * Usa cscript ospp.vbs /dstatus para listar las licencias activas (incluyendo la LTSC que está dando problemas).

Anota los últimos 5 dígitos de la licencia LTSC.

Ejecuta cscript ospp.vbs /unpkey:XXXXX para eliminarla y dejar solo la correcta.

Nota: Este método asegura que la nueva instalación no herede las restricciones o el mensaje de "Producto no activado" de la versión LTSC anterior.