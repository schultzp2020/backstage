/*
 * Copyright 2024 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { forwardRef } from 'react';

import { CheckboxRoot, CheckboxIndicator } from '@base_ui/react';
import { Icon } from '@backstage/canon';
import type { CheckboxProps } from './types';

/** @public */
export const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(
  (props, ref) => {
    const {
      label,
      checked,
      onChange,
      disabled,
      required,
      className,
      name,
      value,
      style,
    } = props;

    const checkboxElement = (
      <CheckboxRoot
        ref={ref}
        className={`checkbox ${className}`}
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
        required={required}
        name={name}
        value={value}
        style={style}
      >
        <CheckboxIndicator className="checkbox-indicator">
          <Icon name="check" size={12} />
        </CheckboxIndicator>
      </CheckboxRoot>
    );

    return label ? (
      <label className="checkbox-label">
        {checkboxElement}
        {label}
      </label>
    ) : (
      checkboxElement
    );
  },
);
