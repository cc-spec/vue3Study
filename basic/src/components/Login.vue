<template>
  <el-form
    :model="ruleForm"
    status-icon
    :rules="rules"
    ref="ruleForm"
    label-width="100px"
    class="demo-ruleForm"
  >
    <el-form-item label="姓名" prop="pass">
      <el-input
        type="password"
        v-model="ruleForm.pass"
        autocomplete="off"
      ></el-input>
    </el-form-item>
    <el-form-item label="密码" prop="checkPass">
      <el-input
        type="password"
        v-model="ruleForm.checkPass"
        autocomplete="off"
      ></el-input>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="handleLogin('ruleForm')">提交</el-button>
      <el-button @click="resetForm('ruleForm')">重置</el-button>
    </el-form-item>
  </el-form>
</template>
<script setup>
function handleLogin() {
  formRef.value.validate(async valid => {
    if (valid) {
      loading.value = true
      const {code, message} = await useStore.login(loginForm)
      loading.value = false
      if(code===0){
        router.replace( toPath || '/')
      }else{
        message({
          message: '登录失败',
          type: 'error'
        })
      }
    } else {
      console.log('error submit!!')
      return false
    }
  })
}
</script>
<style></style>