<template>
  <div class="comp-area">
    <s-table-layout>
      <template #form>
        <z-form ref="formData" :model="formData" label-width="80px">
          <s-form-items :configs="formItems" :form-data="formData" :col="4" :isExpanded="true" @search="fetchData">
            <template #generalCategoryName>
              <s-fuzzy-select v-model="formData.generalCategoryName" :remote-method="getPoiOptions" />
            </template>
            <template #distinctFromSite>
              <z-input-number
                v-model="formData.distinctFromSiteMin"
                :precision="0"
                :min="0"
                :max="9999"
                :controls="false"
                placeholder="请输入"
              />
              <span class="text">至</span>
              <z-input-number
                v-model="formData.distinctFromSiteMax"
                :precision="0"
                :min="0"
                :max="9999"
                :controls="false"
                placeholder="请输入"
              />
            </template>
          </s-form-items>
        </z-form>
      </template>

      <template #page-title>表单</template>

      <template #table>
        <s-table
          ref="sTable"
          :columns="columns"
          :params="params"
          :data.sync="tableData"
          class="area-table"
          :api="'/huiyan-gis/newFence/pageTerminalFence'"
        >
          <template #manageAreaName="{ row }">
            {{ row.manageAreaCode && row.manageAreaName ? `${row.manageAreaName}/${row.manageAreaCode}` : '-' }}
          </template>
          <template #secondManageAreaName="{row}">
            {{
              row.secondManageAreaCode && row.secondManageAreaName
                ? `${row.secondManageAreaName}/${row.secondManageAreaCode}`
                : '-'
            }}
          </template>
          <template #siteName="{ row }">
            <z-button type="text" @click="toDetail(row)">
              {{ row.siteCode && row.siteName ? `${row.siteName}/${row.siteCode}` : '-' }}
            </z-button>
          </template>
          <template #default="{ row }">
            <z-button type="text" @click="editTerminalData(row)">修改</z-button>
          </template>
        </s-table>
      </template>
    </s-table-layout>

    <!-- 修改弹框 -->
    <z-dialog title="终端属性修改" :visible.sync="showDialog">
      <z-form ref="dialogData" :model="dialogData" label-width="100px">
        <s-form-items :configs="dialogItems" :form-data="dialogData" :col="2" :showActions="false">
          <template #fenceNameLabel>
            <span>
              终端名称
              <z-tooltip
                effect="dark"
                content="乡镇/街道（或村组或路）+ 地域性标致+末端类型；譬如：华新镇宝龙广场、赵巷镇地铁站、嘉松中路奥莱广场一期"
                placement="top"
              >
                <i class="z-icon-question"></i>
              </z-tooltip>
            </span>
          </template>
          <!-- 终端类型 -->
          <template #categoryCode>
            <z-select v-model="dialogData.categoryCode" filterable placeholder="请选择POI" @change="onChangePoi">
              <z-option
                v-for="item in poiList"
                :key="item.categoryCode"
                :value="item.categoryCode"
                :label="`${item.generalCategoryName}/${item.subCategoryName}`"
              ></z-option>
            </z-select>
          </template>
          <template #overDistrictsDesc>
            <!-- 省市区乡镇 -->
            <z-cascader
              ref="areaRef"
              v-model="dialogData.area"
              :options="areaList"
              :props="areaProps"
              @change="getAreaNodes"
            ></z-cascader>
            <!-- 村多选 -->
            <z-cascader
              ref="villageRef"
              v-model="dialogData.village"
              :options="villageList"
              :props="villageProps"
              :disabled="!canCheck"
              collapse-tags
              @change="getVillageNodes"
            ></z-cascader>
          </template>
        </s-form-items>
      </z-form>
      <div slot="footer" class="dialog-footer">
        <z-button @click="showDialog = false">取消</z-button>
        <z-button type="primary" @click="confirm">确定</z-button>
      </div>
    </z-dialog>
  </div>
</template>
<script>
import { editTerminal, getAreaFence, poiQuery } from '@/api/gisFence.js'

export default {
  data() {
    return {
      formData: {
        manageAreaCode: '', // 管区code
        secondManageAreaCode: '', // 网格code
        siteId: '', // 网点id
        fenceName: undefined, // 终端名称
        generalCategoryName: undefined, // 终端类型
        subCategoryName: undefined, // 终端子类型
        distinctFromSiteMinc: undefined, // 最小距离网点距离
        distinctFromSiteMax: undefined // 最大距离网点距离
      },
      tableData: [], // 列表数据
      columns: [
        { label: '管区', prop: 'manageAreaName', width: 90, showSlot: true },
        { label: '网格', prop: 'secondManageAreaName', showSlot: true, width: 140 },
        { label: '网点', prop: 'siteName', showSlot: true, width: 120 },
        { label: '终端编码', prop: 'fenceCode', width: 120 },
        { label: '终端名称', prop: 'fenceName', width: 120 },
        { label: '终端类型', prop: 'generalCategoryName', width: 120 },
        { label: '终端子类型', prop: 'subCategoryName', width: 120 },
        { label: '覆盖的行政区域', prop: 'overDistrictsDesc', width: 120 },
        { label: '绑定门店', prop: 'bindStore', width: 120 },
        { label: '绑定代理点', prop: 'bindAgent', width: 120 },
        { label: '绑定的业务员', prop: 'bindSalesmanList', width: 120 },
        { label: '距离网点距离-中心点(KM)', prop: 'distinctFromSite', width: 170 },
        { label: '面积(㎡)', prop: 'area', width: 120 },
        { label: '面积占比', prop: 'precentOfArea', width: 120 }
      ],
      showDialog: false, // 是否显示修改弹框
      dialogData: {
        siteId: '', // 网点id
        siteName: '', // 网点name
        fenceName: '', // 终端名称
        generalCategoryName: '', // 终端类型
        subCategoryName: '', // 终端子类型
        categoryCode: '', // 终端类型code
        bindList: [], // 绑定对象
        area: [], // 省市区乡镇
        village: [], // 村
        remark: '' // 备注
      }, // 对话框数据
      areaList: [], // 省市区选项
      areaProps: {
        lazy: true,
        value: 'areaId',
        label: 'name',
        async lazyLoad(node, resolve) {
          const { level: layer, value: parentId } = node
          const params = {
            layer,
            parentId
          }
          const res = await getAreaFence(params)
          if (res.status) {
            const result = res.result.map(item => {
              return {
                ...item,
                label: item.name,
                value: item.areaId,
                leaf: layer === 2
              }
            })
            resolve(result)
          }
        }
      }, // 省市区级联选择框配置
      villageList: [], // 乡镇村选项
      area: {},
      village: {
        county: {},
        communitys: []
      },
      poiList: [] // 终端列表
    }
  },
  computed: {
    params() {
      return {
        ...this.formData
      }
    },
    canCheck() {
      return Array.isArray(this.dialogData.area)
    },
    villageProps() {
      const _this = this
      return {
        multiple: true,
        lazy: true,
        value: 'areaId',
        label: 'name',
        async lazyLoad(node, resolve) {
          let result
          if (!Array.isArray(_this.dialogData.area)) {
            result = _this.villageList
          } else {
            const { value: parentId } = node
            const params = {
              layer: 4,
              parentId
            }
            const res = await getAreaFence(params)
            if (res.status) {
              result = res.result.map(item => ({
                ...item,
                label: item.name,
                value: item.areaId,
                leaf: params.layer === 4
              }))
              resolve(result)
            }
          }
        }
      }
    },
    // 搜索表单项
    formItems() {
      return [
        {
          label: '所属管区',
          prop: 'manageAreaCode',
          itemType: 'hyManageArea',
          props: { defaultZone: true, isDefaultLoadedData: true }
        },
        {
          label: '所属网格',
          prop: 'secondManageAreaCode',
          itemType: 'hyNetGrid',
          props: {
            isDefaultLoadedData: true,
            area: this.formData.manageAreaCode
          }
        },
        {
          label: '网点名称',
          prop: 'siteId',
          itemType: 'hyAllSite',
          props: this.formData.manageAreaCode ? { manageAreas: [this.formData.manageAreaCode] } : {}
        },
        {
          label: '终端名称',
          prop: 'fenceName',
          itemType: 'input',
          collapse: true
        },
        {
          label: '终端类型',
          prop: 'generalCategoryName',
          itemType: 'select',
          collapse: true
        },
        {
          label: '终端子类型',
          prop: 'subCategoryName',
          itemType: 'fuzzySelect',
          collapse: true,
          remoteMethod(query) {}
        },
        {
          label: '距离',
          prop: 'distinctFromSite',
          collapse: true,
          showSlot: true
        }
      ]
    },
    // 修改对话框表单项
    dialogItems() {
      const _this = this
      return [
        {
          label: '网点名称',
          prop: 'siteId',
          itemType: 'hyAllSite',
          props: this.formData.manageAreaCode ? { manageAreas: [this.formData.manageAreaCode] } : {}
        },
        {
          label: '终端名称',
          prop: 'fenceName',
          itemType: 'input',
          showLabelSlot: true
        },
        {
          label: '终端类型',
          prop: 'categoryCode',
          showSlot: true
        },
        {
          label: '绑定门店',
          prop: 'bindStoreList',
          itemType: 'select'
        },
        {
          label: '绑定代理点',
          prop: 'bindAgentList',
          itemType: 'select'
        },
        {
          label: '绑定业务员',
          prop: 'bindSalesmanList',
          itemType: 'select'
        },
        {
          label: '覆盖的行政区域',
          prop: 'overDistrictsDesc',
          showSlot: true,
          span: 2
        },
        /* {
          label: '绑定的业务员',
          prop: 'e'
        }, */
        {
          label: '备注',
          prop: 'remark',
          itemType: 'input',
          type: 'textarea',
          rows: 3,
          span: 2
        }
      ]
    }
  },
  created() {
    if (!this.poiList.length) this.poiQueryHandler()
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.$refs.sTable.fetchData()
    },
    // 模糊查询终端类型
    getPoiOptions(query) {
      poiQuery({ generalCategory: query }).then(res => {
        if (res.status) {
          return res.result
        }
      })
    },
    // 网点下钻至围栏详情
    toDetail(row) {
      this.$router.push({
        name: 'newFenceManagementDetail',
        query: {
          siteId: `${row.siteId}`,
          title: `${row.siteName}/${row.siteCode}`,
          edetail: 'y',
          elabel: `${row.siteName}/${row.siteCode}`,
          eiframe: 1
        }
      })
    },
    // 修改
    editTerminalData(row) {
      this.showDialog = true
      const { bindStoreList, bindAgentList, bindSalesmanList, ...data } = { ...row }
      this.dialogData = { ...data }
      this.onChangePoi()
      debugger
    },
    // 获取POI
    poiQueryHandler() {
      poiQuery({}).then(res => {
        if (res.status) {
          this.poiList = res.result || []
        }
      })
    },
    // poi change
    onChangePoi() {
      const poi = this.poiList.find(item => item.categoryCode === this.dialogData.categoryCode)
      const { generalCategoryName, subCategoryName } = poi
      this.dialogData.generalCategoryName = generalCategoryName
      this.dialogData.subCategoryName = subCategoryName
    },
    // 省市区值change
    async getAreaNodes(node) {
      const nodes = this.$refs.areaRef.getCheckedNodes()
      // 省市区参数
      const { path, pathLabels } = { ...nodes[0] }
      this.area = {
        provice: { areaId: path[0], name: pathLabels[0], layer: 0 },
        city: { areaId: path[1], name: pathLabels[1], layer: 1 },
        district: { areaId: path[2], name: pathLabels[2], layer: 2 }
      }
      this.villageList = []
      // 省市区改变根据最后一个节点获取乡镇
      const params = {
        layer: 3,
        parentId: node[node.length - 1]
      }
      const res = await getAreaFence(params)
      if (res.status) {
        this.villageList = res.result.map(item => ({
          ...item,
          label: item
        }))
      }
      this.dialogData.area = nodes.length ? [...nodes[0]] : []
    },
    // 乡镇村值
    getVillageNodes(node) {
      const nodes = this.$refs.villageRef.getCheckedNodes()
      // 乡镇村参数
      this.village = {}
      if (nodes.length) {
        nodes.forEach(item => {
          const { label, level, value, parent } = item
          this.village.county.push({ areaId: parent.value, name: parent.label, layer: parent.level + 2 })
          this.village.communitys.push({ areaId: value, name: label, layer: level + 2 })
        })
      }
      this.dialogData.village = nodes.length ? [...nodes[0]] : []
    },
    // 确认
    confirm() {
      if (this.$refs.villageRef.getCheckedNodes().length > 5) {
        this.$message.warning('最大选择5个村')
        return
      }
      const { area, village, ...dialogData } = this.dialogData
      debugger
      const params = {
        ...this.area,
        ...this.village,
        ...dialogData
      }
      this.showDialog = false
      editTerminal(params).then(res => {
        if (res.status) {
          this.$message.success('修改成功')
          this.fetchData()
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.comp-area {
  height: calc(100vh - 95px);
}
::v-deep .area-table .content__body {
  height: calc(100% - 50px);
}

.text {
  padding: 0 !important;
  margin: 0 10px;
  text-align: center;
}

::v-deep .z-input-number--small {
  width: 40%;
}
::v-deep .z-input-number .z-input__inner {
  text-align: left;
  padding-left: 7px;
}

.z-dialog__header {
  text-align: center;
}

.z-cascader--small:nth-child(1) {
  width: 40%;
}

.z-cascader--small:nth-child(2) {
  width: 55%;
  margin-left: 5%;
}
</style>
