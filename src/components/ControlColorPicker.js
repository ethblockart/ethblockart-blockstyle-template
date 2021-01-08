import React from 'react';

const ControlColorPicker = function (props) {
    const handleColorChange = event => {
        props.onChange(event.target.value)
    }

    return (
        <div>
            <label className="Sidebar__ContentHeader">{props.controlLabel}</label>
            <input
                id="controlColorPicker"
                type="color"
                defaultValue={props.modValue}
                onInput={handleColorChange}
            />
        </div>
    );
}
export default ControlColorPicker;