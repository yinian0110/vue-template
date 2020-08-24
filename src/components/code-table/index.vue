<template>
    <div class="compomtents_code_table">
        <el-table v-loading="loading" element-loading-text="正在加载中..." stripe :data="dataList" :cell-style="{ 'text-align': 'left' }" :header-cell-style="{ 'text-align': 'left', color: '#666' }" highlight-current-row>
            <el-table-column prop="title" label="标题">
                <template slot-scope="scope">
                    <p style="display:flex;"><span style="margin-right:5px;">{{scope.row.title}}</span><i @click="showMaxImage(scope.row.qrcode_image)" class="icon-base icon-code"></i></p>
                    <el-button icon="el-icon-download" size="mini"><a style="text-decoration: none; color:#606266;" :href="scope.row.qrcode_image"  target="_blank" download>下载活码</a></el-button>
                </template>
            </el-table-column>
            <el-table-column prop="qrcode_num" label="二维码概况">
                <span slot-scope="scope">
                    <p>总数量：<span>{{scope.row.qrcode_num}}</span></p>
                    <p>2日内到期：<span>{{scope.row.due_within_two_days}}</span></p>
                </span>
            </el-table-column>
            <el-table-column prop="today_usage" label="今日使用情况">
                <span slot-scope="scope">
                    <p>打开：<span>{{scope.row.today_usage.open}}</span></p>
                    <p>长按：<span>{{scope.row.today_usage.press}}</span></p>
                </span>
            </el-table-column>
            <el-table-column prop="total_usage" label="全部使用情况">
                <span slot-scope="scope">
                    <p>打开：<span>{{scope.row.total_usage.open}}</span></p>
                    <p>长按：<span>{{scope.row.total_usage.press}}</span></p>
                </span>
            </el-table-column>
            <el-table-column prop="surplus" label="剩余长按次数"></el-table-column>
            <el-table-column label="操作" width="200">
                <span slot-scope="scope">
                    <el-button size="mini" style="margin-right:10px;" icon="el-icon-edit" @click="editCode(scope.row.id,'edit')">编辑</el-button>
                    <el-button type="danger" size="mini" icon="el-icon-delete" @click="deleteCode(scope.row.id)" >删除</el-button>
                </span>
            </el-table-column>
        </el-table>
        <el-dialog title="查看二维码" :visible.sync="imgDialogVisible" custom-class="dialog-380">
            <img :src="maxImageUrl" style="margin:0 auto;max-width:260px;" />
        </el-dialog>
    </div>
</template>
<script>
import { deleteLiveCode } from '@/api/code-api';
export default {
    name: 'code-table',
    data() {
        return {
            imgDialogVisible: false,
            maxImageUrl: ''
        };
    },
    props: {
        loading: {
            type: Boolean,
            default: false
        },
        dataList: {
            type: Array,
            default: () => []
        },
        type: {
            type: String,
            default: ''
        }
    },
    methods: {
        showMaxImage(qrcode) {
            this.imgDialogVisible = true;
            this.maxImageUrl = qrcode;
        },
        editCode(id, type) {
            this.$router.push({
                name: 'create-code',
                query: {
                    id: id,
                    type: this.type,
                    options_type: type
                }
            });
        },
        deleteCode(id) {
            this.$confirm('此操作将永久删除该内容, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            })
                .then(() => {
                    const data = {
                        _type: this.type,
                        id: id
                    };
                    deleteLiveCode(data).then(() => {
                        this.$message({
                            type: 'success',
                            message: '删除成功!'
                        });
                        this.$emit('sureDelete');
                    });
                })
                .catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    });
                });
        }
    }
};
</script>
<style lang="scss" scoped>
.compomtents_code_table {
}
</style>
