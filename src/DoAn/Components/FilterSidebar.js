import React, { useState, useEffect } from 'react';
import { Slider, Select } from 'antd';  
import axios from 'axios'; 

const { Option } = Select;

const FilterSidebar = ({ onFilterChange, showCategories }) => {
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 20000000]);
  const [colors, setColors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [sortOption, setSortOption] = useState('newest');

  useEffect(() => {
    const fetchColors = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}api//mau-sac`); 
        setColors(response.data);
      } catch (error) {
        console.error('Error fetching colors:', error);
      }
    };
    const fetchSizes = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/kich-thuoc`); 
        setSizes(response.data);
      } catch (error) {
        console.error('Error fetching sizes:', error);
      }
    };
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/loai-san-pham`); 
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchColors();
    fetchCategories();
    fetchSizes();
  }, []);

  const handleSearch = () => {
    onFilterChange({
      colors: selectedColors,
      categories: selectedCategories,
      sizes: selectedSizes,
      priceRange,
      sortOption,
    });
  };

  const handleResetFilters = () => {
    setSelectedColors([]);  
    setSelectedCategories([]);  
    setSelectedSizes([]);
    setPriceRange([0, 20000000]);  
    setSortOption('newest');  // Reset sort option to default
    onFilterChange({ colors: [], categories: [], sizes: [], priceRange: [0, 20000000], sortOption: 'newest' });
  };
  return (
    <div className="filter-sidebar">    
      <h4>Color</h4>
      {colors.map(color => (
        <div key={color.id} className="color-checkbox">
          <input 
            type="checkbox" 
            value={color.id} 
            checked={selectedColors.includes(color.id)}  
            onChange={(e) => setSelectedColors(prev => e.target.checked 
              ? [...prev, color.id] 
              : prev.filter(c => c !== color.id))}  
          />
          <label style={{ marginLeft: '8px' }}>{color.ten_mau}</label>
          <div 
            className="color-swatch" 
            style={{ backgroundColor: color.ma_mau, width: '20px', height: '20px', display: 'inline-block', marginLeft: '8px' }} 
          />
        </div>
      ))}

      {/* Hiển thị phần Category chỉ khi showCategories là true */}
      {showCategories && (
        <>
          <h4>Category</h4>
          <Select 
            mode="multiple" 
            value={selectedCategories} 
            onChange={setSelectedCategories} 
            style={{ width: '100%', marginBottom: '20px' }}
            placeholder="Chọn loại sản phẩm"
          >
            {categories.map(category => (
              <Option key={category.id} value={category.id}>{category.tenLoaiSP}</Option>
            ))}
          </Select>
        </>
      )}
      <h4>Size</h4>
      <Select 
        mode="multiple" 
        value={selectedSizes} 
        onChange={setSelectedSizes} 
        style={{ width: '100%', marginBottom: '20px' }}
        placeholder="Chọn kích thước"
      >
        {sizes.map(size => (
          <Option key={size.id} value={size.id}>{size.kich_thuoc}</Option> // Adjust to your size property names
        ))}
      </Select>      

      <h4>Sort By</h4>
      <Select 
        value={sortOption} 
        onChange={(value) => setSortOption(value)} 
        style={{ width: '100%', marginBottom: '20px' }}
      >
        <Option value="newest">Mới nhất</Option>
        <Option value="priceAsc">Giá: Tăng dần</Option>
        <Option value="priceDesc">Giá: Giảm dần</Option>
      </Select>

      <h4>Price Range</h4>
      <Slider 
        range 
        value={priceRange} 
        min={0} 
        max={20000000} 
        tipFormatter={value => value ? `${value.toLocaleString('vi-VN')}₫` : '0₫'} 
        onChange={setPriceRange}
      />

      <div className="selected-filters">
        <h4>Selected Filters:</h4>
        <div>
          {selectedColors.length > 0 && (
            <div>
              <span>Colors: </span>
              <span>
                {selectedColors
                  .map(colorId => 
                    colors.find(color => color.id === colorId)?.ten_mau)
                  .filter(Boolean) // Filter out any undefined values
                  .join(', ')}
              </span>
            </div>
          )}

          {selectedCategories.length > 0 && (
            <div>
              <span>Categories: </span>
              <span>
                {selectedCategories
                  .map(id => 
                    categories.find(category => category.id === id)?.tenLoaiSP) // Get the name of the category
                  .filter(Boolean) // Filter out any undefined values
                  .join(', ')}
              </span>
            </div>
          )}

          {selectedSizes.length > 0 && (
            <div>
              <span>Sizes: </span>
              <span>
                {selectedSizes
                  .map(sizeId => 
                    sizes.find(size => size.id === sizeId)?.kich_thuoc) 
                  .filter(Boolean) 
                  .join(', ')}
              </span>
            </div>
          )}

          <div>
            <span>Price Range: </span>
            <span>
              {priceRange[0].toLocaleString('vi-VN')}₫ - {priceRange[1].toLocaleString('vi-VN')}₫
            </span>
          </div>

          <div>
            <span>Sort By:</span>
            <span>
              {sortOption === 'newest' ? 'Mới nhất' : 
              sortOption === 'priceAsc' ? 'Giá tăng dần' : 
              sortOption === 'priceDesc' ? 'Giá giảm dần' : 'Default'}
            </span>
          </div>
        </div>
      </div>

      <div className="filter-buttons">
        <button onClick={handleSearch} className='search-filter'>Search</button>
        <button onClick={handleResetFilters} className='reset-filter'>Reset</button>
      </div>

    </div>
  );
};

export default FilterSidebar;
